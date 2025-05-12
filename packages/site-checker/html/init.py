import http.server
import socketserver
import webbrowser
import os
import json
import glob
import subprocess
from pathlib import Path
from flask import Flask, request, jsonify

# Configurações do servidor
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
SRC_DIRECTORY = os.path.join(Path(DIRECTORY).parent, 'src')

app = Flask(__name__, static_folder=DIRECTORY)

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

const functions = [];

function visit(node) {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
        const name = node.name ? node.name.getText() : 'anonymous';
        functions.push(name);
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

def find_function_file(function_name):
    ts_files = get_ts_files(SRC_DIRECTORY)
    
    for file_path in ts_files:
        functions = get_functions_from_file(file_path)
        if function_name in functions:
            return file_path
    
    return None

def create_function_call_file(original_file, function_name, url):
    # Get the original file name without extension
    original_name = os.path.basename(original_file)[:-3]
    
    # Create the new file content
    import_statement = f'import {{ {function_name} }} from "./{original_name}";'
    
    # Create the function call with URL parameter
    function_call = f'const result = {function_name}("{url}");'
    
    # Add code to handle and display the result
    result_handling = """
// Handle both Promise and non-Promise results
const handleResult = async (result) => {
    try {
        // If result is a Promise, await it
        const finalResult = await (result instanceof Promise ? result : result);
        console.log(JSON.stringify(finalResult, null, 2));
    } catch (error) {
        console.error('Error executing function:', error);
    }
};

handleResult(result);
"""
    
    # Combine the content
    content = f'{import_statement}\n\n{function_call}\n\n{result_handling}\n'
    
    # Write to the new file
    output_path = os.path.join(SRC_DIRECTORY, '0.ts')
    with open(output_path, 'w') as f:
        f.write(content)
    
    return output_path

def execute_typescript_file(file_path):
    try:
        # Execute the TypeScript file using node --import=tsx
        result = subprocess.run(['node', '--import=tsx', file_path], 
                              capture_output=True, 
                              text=True)
        
        # Return the output
        if result.stdout:
            return result.stdout.strip()
        if result.stderr:
            return f"Error: {result.stderr}"
            
    except subprocess.CalledProcessError as e:
        return f"Error executing the TypeScript file: {e}"
    except Exception as e:
        return f"Unexpected error: {e}"
    finally:
        # Remove the temporary TypeScript file
        try:
            os.remove(file_path)
        except Exception:
            pass

@app.route('/api/uppercase', methods=['POST'])
def uppercase_handler():
    data = request.get_json()
    function_name = data.get('functionName', '')
    url = data.get('url', '')

    print("\n" + "="*50)
    print("TESTE SOLICITADO:")
    print(f"Função: {function_name}")
    print(f"URL: {url}")
    print("="*50 + "\n")
    
    if not function_name:
        return jsonify({'error': 'functionName é obrigatório'}), 400
    if not url:
        return jsonify({'error': 'url é obrigatório'}), 400
    
    # Encontrar o arquivo que contém a função
    function_file = find_function_file(function_name)
    if not function_file:
        print(f"ERRO: Função '{function_name}' não encontrada!")
        return jsonify({'error': f'Função {function_name} não encontrada'}), 404
    
    print(f"Arquivo encontrado: {function_file}")
    
    # Criar arquivo temporário com a chamada da função
    temp_file = create_function_call_file(function_file, function_name, url)
    
    # Executar o arquivo e obter o resultado
    result = execute_typescript_file(temp_file)
    print(f"Resultado: {result}\n")
    
    return jsonify({'result': result})

@app.route('/<path:path>')
def serve_file(path):
    return app.send_static_file(path)

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

def open_browser():
    """Abre o navegador com a URL local"""
    webbrowser.open(f'http://localhost:{PORT}')

def main():
    try:            
        webbrowser.open(f'http://localhost:{PORT}')
        # Inicia o servidor Flask
        print(f"\n🚀 Servidor iniciado em http://localhost:{PORT}")
        print(f"📂 Servindo arquivos de: {DIRECTORY}")
        print("⌨️  Pressione Ctrl+C para parar o servidor\n")
            
        app.run(port=PORT)
    except KeyboardInterrupt:
        print("\n🛑 Servidor parado pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro ao iniciar o servidor: {e}")
        
if __name__ == "__main__":
    main()
