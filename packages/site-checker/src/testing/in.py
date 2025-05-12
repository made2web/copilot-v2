#!/usr/bin/env python3

import os
import glob
import inquirer
import subprocess
import json
from pathlib import Path
import re

def get_ts_files(directory):
    # Get all .ts files from the directory
    ts_files = glob.glob(os.path.join(directory, "*.ts"))
    # Filter out files with 'util' in the name
    filtered_files = [f for f in ts_files if 'util' not in os.path.basename(f).lower()]
    return filtered_files

def get_functions_from_file(file_path):
    # Use TypeScript compiler API through a temporary Node.js script to extract functions
    temp_script = """
const ts = require('typescript');
const fs = require('fs');

const sourceFile = ts.createSourceFile(
    process.argv[2],
    fs.readFileSync(process.argv[2], 'utf8'),
    ts.ScriptTarget.Latest,
    true
);

function getTypeText(type) {
    if (!type) return 'any';
    
    if (ts.isUnionTypeNode(type)) {
        return {
            kind: 'union',
            types: type.types.map(t => t.getText())
        };
    } else if (ts.isLiteralTypeNode(type)) {
        return {
            kind: 'literal',
            value: type.literal.getText()
        };
    } else {
        const typeText = type.getText();
        // Check if it's an enum-like type (string literal union)
        if (typeText.includes('|')) {
            const types = typeText.split('|').map(t => t.trim());
            if (types.every(t => t.startsWith('"') || t.startsWith("'"))) {
                return {
                    kind: 'enum',
                    values: types.map(t => t.slice(1, -1))
                };
            }
        }
        return typeText;
    }
}

const functions = [];

function visit(node) {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
        const name = node.name ? node.name.getText() : 'anonymous';
        const parameters = node.parameters.map(param => ({
            name: param.name.getText(),
            type: getTypeText(param.type)
        }));
        functions.push({
            name: name,
            parameters: parameters
        });
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);
console.log(JSON.stringify(functions));
"""
    
    # Write temporary Node.js script
    with open('temp_parser.js', 'w') as f:
        f.write(temp_script)
    
    try:
        # Run the Node.js script and capture output
        result = subprocess.run(['node', 'temp_parser.js', file_path], 
                              capture_output=True, text=True)
        functions = json.loads(result.stdout)
        return functions
    except Exception as e:
        print(f"Error parsing functions: {e}")
        return []
    finally:
        # Clean up temporary script
        if os.path.exists('temp_parser.js'):
            os.remove('temp_parser.js')

def get_param_value(param):
    param_type = param["type"]
    param_name = param["name"]
    
    # Handle complex types (enum, union, literal)
    if isinstance(param_type, dict):
        kind = param_type.get("kind")
        
        if kind == "enum":
            # For enum types, show a selection list
            questions = [
                inquirer.List('value',
                             message=f'Select value for "{param_name}":',
                             choices=param_type["values"])
            ]
            answer = inquirer.prompt(questions)
            return answer['value'] if answer else None
            
        elif kind == "union":
            # For union types, show the possible types and ask for input
            type_str = " | ".join(param_type["types"])
            print(f"\nParameter {param_name} must be one of: {type_str}")
            questions = [
                inquirer.Text('value',
                             message=f'Enter value for "{param_name}" ({type_str}):')
            ]
            answer = inquirer.prompt(questions)
            return answer['value'] if answer else None
            
        elif kind == "literal":
            # For literal types, show the exact value needed
            print(f"\nParameter {param_name} must be exactly: {param_type['value']}")
            return param_type['value'].strip('"\'')
    
    # For boolean type, show yes/no selection
    elif isinstance(param_type, str) and param_type.lower() == "boolean":
        questions = [
            inquirer.List('value',
                         message=f'Select value for "{param_name}" (boolean):',
                         choices=['true', 'false'])
        ]
        answer = inquirer.prompt(questions)
        return answer['value'] if answer else None
    
    # For number types, validate input is actually a number
    elif isinstance(param_type, str) and param_type.lower() in ["number", "integer"]:
        while True:
            questions = [
                inquirer.Text('value',
                             message=f'Enter value for "{param_name}" ({param_type}):')
            ]
            answer = inquirer.prompt(questions)
            if not answer:
                return None
            
            try:
                float(answer['value'])
                return answer['value']
            except ValueError:
                print(f"Error: Please enter a valid {param_type}")
    
    # Default case: free text input
    else:
        questions = [
            inquirer.Text('value',
                         message=f'Enter value for "{param_name}" ({param_type}):')
        ]
        answer = inquirer.prompt(questions)
        return answer['value'] if answer else None

def create_function_call_file(directory, original_file, function_info, param_values):
    # Get the original file name without extension
    original_name = os.path.basename(original_file)[:-3]
    
    # Create the new file content
    import_statement = f'import {{ {function_info["name"]} }} from "./{original_name}";'
    
    # Create the function call with parameters
    param_strings = []
    for param, value in zip(function_info["parameters"], param_values):
        # If the value is a string and not a number or boolean, wrap it in quotes
        if (isinstance(param["type"], str) and 
            param["type"].lower() not in ["number", "integer", "boolean"]):
            value = f'"{value}"'
        param_strings.append(value)
    
    function_call = f'const result = {function_info["name"]}({", ".join(param_strings)});'
    
    # Add code to handle and display the result
    result_handling = """
// Function to safely stringify any value
function safeStringify(value: any): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'function') return '[Function]';
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value, null, 2);
        } catch (error) {
            return String(value);
        }
    }
    return String(value);
}

// Handle both Promise and non-Promise results
const handleResult = async (result: any) => {
    try {
        // If result is a Promise, await it
        const finalResult = await (result instanceof Promise ? result : result);
        console.log('\\nFunction Result:\\n', safeStringify(finalResult));
    } catch (error) {
        console.error('\\nError executing function:\\n', error);
    }
};

handleResult(result);
"""
    
    # Combine the content
    content = f'{import_statement}\n\n{function_call}\n\n{result_handling}\n'
    
    # Write to the new file
    output_path = os.path.join(directory, '0.ts')
    with open(output_path, 'w') as f:
        f.write(content)
    
    print(f"\nCreated file: {output_path}")
    return output_path

def execute_typescript_file(file_path):
    print("\nExecuting the function...")
    
    try:
        # First, check if tsx is installed
        try:
            subprocess.run(['npm', 'list', '-g', 'tsx'], 
                         capture_output=True, 
                         check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("\nInstalling tsx...")
            subprocess.run(['npm', 'install', '-g', 'tsx'], 
                         check=True)
        
        # Execute the TypeScript file using node --import=tsx
        result = subprocess.run(['node', '--import=tsx', file_path], 
                              capture_output=True, 
                              text=True)
        
        # Print the output
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)
            
    except subprocess.CalledProcessError as e:
        print(f"\nError executing the TypeScript file: {e}")
        if e.output:
            print(e.output)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
    finally:
        # Remove the temporary TypeScript file
        try:
            os.remove(file_path)
            print(f"\nRemoved temporary file: {file_path}")
        except Exception as e:
            print(f"\nError removing temporary file: {e}")

def main():
    # Get the parent directory (one level up)
    parent_dir = str(Path(__file__).parent.parent)
    
    # Get TypeScript files and sort them alphabetically by basename
    ts_files = sorted(get_ts_files(parent_dir), key=lambda x: os.path.basename(x).lower())
    
    if not ts_files:
        print("No TypeScript files found (excluding files with 'util' in the name).")
        return
    
    # Print the list of files first
    print("\nAvailable TypeScript files:")
    for idx, file in enumerate(ts_files, 1):
        print(f"{idx}. {os.path.basename(file)}")
    
    print("\nSelect a file to examine its functions:")
    
    # Create file selection question
    questions = [
        inquirer.List('file',
                     message="Select a TypeScript file:",
                     choices=[os.path.basename(f) for f in ts_files])
    ]
    
    # Get user's file selection
    answers = inquirer.prompt(questions)
    
    if not answers:
        return
    
    selected_file = next(f for f in ts_files if os.path.basename(f) == answers['file'])
    
    # Get functions from selected file
    functions = get_functions_from_file(selected_file)
    
    if not functions:
        print(f"No functions found in {answers['file']}")
        return
    
    # Sort functions alphabetically by name
    functions.sort(key=lambda x: x["name"].lower())
    
    # Print the list of functions first
    print(f"\nAvailable functions in {answers['file']}:")
    for idx, func in enumerate(functions, 1):
        params = ", ".join([f"{p['name']}: {p['type']}" for p in func["parameters"]])
        print(f"{idx}. {func['name']}({params})")
    
    print("\nSelect a function to execute:")
    
    # Create function selection question
    questions = [
        inquirer.List('function',
                     message="Select a function:",
                     choices=[f["name"] for f in functions])
    ]
    
    # Get user's function selection
    function_answer = inquirer.prompt(questions)
    
    if not function_answer:
        return
    
    # Get the selected function info
    selected_function = next(f for f in functions if f["name"] == function_answer["function"])
    
    # Get values for each parameter with validation
    param_values = []
    for param in selected_function["parameters"]:
        value = get_param_value(param)
        if value is None:
            return
        param_values.append(value)
    
    # Create the new TypeScript file with the function call
    output_file = create_function_call_file(parent_dir, selected_file, selected_function, param_values)
    
    # Execute the generated TypeScript file
    execute_typescript_file(output_file)

if __name__ == "__main__":
    main()
