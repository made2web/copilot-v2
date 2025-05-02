# Version 1.2

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path
import os
import fnmatch
from typing import List, Dict, Optional, Union
from pydantic import BaseModel
from fastapi import Query
import asyncpg  # Biblioteca assíncrona para PostgreSQL
from typing import Any

# Pool de conexões global
pool = None

@asynccontextmanager
async def lifespan(the_app):
    # Verificação do .env
    env_path = Path('.env')
    if env_path.exists():
        with open(env_path, 'r') as f:
            lines = f.readlines()
        api_key = None
        for line in lines:
            line = line.strip()
            if line.startswith('JAKE_PROJECT_KEY='):
                _, key_value = line.split('=', 1)
                api_key = key_value.strip().replace('"', '')
                break
        
        if api_key:            
            try:                
                project_conn = await asyncpg.connect(
                    host="188.245.240.26",
                    user="postgres",
                    password="Chica0141",
                    database="postgres",
                )
                
                project_data = await project_conn.fetchrow(
                    "SELECT id, host, user, password, database, port, schema "
                    "FROM e.projects WHERE key = '"+api_key+"'",
                )
                
                if project_data:
                    await project_conn.execute("""
                        UPDATE e.users
                        SET "activeProjectId" = $1
                        WHERE id = 'ccccb034-e525-45e4-b7de-ddf16ce4e3be';
                    """, project_data['id'])

                    if all(project_data.get(key) for key in ['host', 'user', 'password', 'database']):
                        global pool
                        pool = await asyncpg.create_pool(
                            host=project_data['host'],
                            user=project_data['user'],
                            password=project_data['password'],
                            database=project_data['database'],
                            min_size=1,
                            max_size=10
                        )

                        print("\nDados do projeto encontrados:")
                        print(f"Project ID: {project_data['id']}")
                else:
                    print("\nNenhum projeto encontrado com a chave fornecida")
                
                # Fechar conexão de verificação
                await project_conn.close()
                
            except Exception as e:
                print(f"\nErro na verificação do projeto: {str(e)}")
            
        else:
            print("ERRO: JAKE_PROJECT_KEY não encontrada no arquivo .env")
    else:
        print("ERRO: Arquivo .env não encontrado")
    
    yield
    await pool.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TableNameRequest(BaseModel):
    table_name: str

class SQLRequest(BaseModel):
    sql_command: str

class ListRequest(BaseModel):
    entryPoints: List[str] = []

class DirectoryItem(BaseModel):
    name: str
    path: str
    is_dir: bool
    size: Optional[int] = None
    children: List['DirectoryItem'] = []

DirectoryItem.model_rebuild()

class FileRequest(BaseModel):
    file_path: str

class BatchFileRequest(BaseModel):
    files: List[FileRequest]

class FileContentResponse(BaseModel):
    filename: str
    content: Optional[str] = None
    size: Optional[int] = None
    success: bool
    error: Optional[str] = None

class FileOperation(BaseModel):
    filename: str
    action: str
    content: Optional[str] = None

class OperationResult(BaseModel):
    filename: str
    action: str
    success: bool
    message: Optional[str] = None

class TableNameRequest(BaseModel):
    table_name: str

class FieldDetail(BaseModel):
    name: str
    type: str
    is_nullable: bool
    default: Optional[str]
    is_primary: bool
    is_foreign: bool
    foreign_table: Optional[str] = None
    foreign_column: Optional[str] = None

def get_ignore_patterns(base_dir: Path):
    ignore_file = base_dir / '.aignore'
    patterns = []
    if ignore_file.exists():
        with open(ignore_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    patterns.append(line)
    return patterns

def should_ignore(path: Path, patterns: List[str], base_dir: Path):
    try:
        relative_path = path.relative_to(base_dir)
    except ValueError:
        return True
    return any(fnmatch.fnmatch(str(relative_path), pattern) for pattern in patterns)

def get_directory_structure(start_path: Path, base_dir: Path):
    patterns = get_ignore_patterns(base_dir)
    children = []
    for item in start_path.iterdir():
        try:
            if item.is_symlink() or item.name == '.aignore':
                continue
            if should_ignore(item, patterns, base_dir):
                continue
            if item.is_dir():
                dir_item = DirectoryItem(
                    name=item.name,
                    path=str(item.relative_to(base_dir)),
                    is_dir=True,
                    children=get_directory_structure(item, base_dir).children
                )
                children.append(dir_item)
            else:
                file_item = DirectoryItem(
                    name=item.name,
                    path=str(item.relative_to(base_dir)),
                    is_dir=False,
                    size=item.stat().st_size
                )
                children.append(file_item)
        except (PermissionError, FileNotFoundError):
            continue
    return DirectoryItem(
        name=start_path.name,
        path=str(start_path.relative_to(base_dir)),
        is_dir=True,
        children=sorted(children, key=lambda x: (not x.is_dir, x.name))
    )

def safe_resolve_path(user_path: str, base_dir: Path):
    requested_path = (base_dir / user_path.lstrip('/')).resolve()
    
    if not requested_path.exists():
        raise HTTPException(status_code=404, detail="Entry point not found")
    if not requested_path.is_relative_to(base_dir):
        raise HTTPException(status_code=403, detail="Path traversal detected")
    return requested_path

from fastapi import HTTPException

@app.post("/list-tables")
async def list_tables():
    try:
        async with pool.acquire() as conn:
            tables = await conn.fetch(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'e'"
            )
            
            result = []
            
            for table in tables:
                table_name = table['table_name']
                
                # Obter colunas e tipos
                columns = await conn.fetch(
                    """SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_schema = 'e' 
                    AND table_name = $1
                    ORDER BY ordinal_position""",
                    table_name
                )
                
                # Obter chaves primárias
                primary_keys = await conn.fetch(
                    """SELECT column_name 
                    FROM information_schema.key_column_usage 
                    WHERE table_schema = 'e' 
                    AND table_name = $1 
                    AND constraint_name IN (
                        SELECT constraint_name 
                        FROM information_schema.table_constraints 
                        WHERE table_schema = 'e' 
                        AND table_name = $1 
                        AND constraint_type = 'PRIMARY KEY'
                    )""",
                    table_name
                )
                primary_key_list = [pk['column_name'] for pk in primary_keys]
                
                # Obter chaves estrangeiras
                foreign_keys = await conn.fetch(
                    """SELECT 
                        kcu.column_name,
                        ccu.table_name AS foreign_table,
                        ccu.column_name AS foreign_column 
                    FROM information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                        ON ccu.constraint_name = tc.constraint_name
                        AND ccu.table_schema = tc.table_schema
                    WHERE tc.constraint_type = 'FOREIGN KEY' 
                        AND tc.table_schema = 'e' 
                        AND tc.table_name = $1""",
                    table_name
                )
                foreign_key_list = [{
                    "column": fk['column_name'],
                    "referenced_table": fk['foreign_table'],
                    "referenced_column": fk['foreign_column']
                } for fk in foreign_keys]
                
                result.append({
                    "table_name": table_name,
                    "columns": [
                        {
                            "column_name": col['column_name'],
                            "data_type": col['data_type']
                        } for col in columns
                    ],
                    "primary_keys": primary_key_list,
                    "foreign_keys": foreign_key_list
                })
            
            return result
            
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.post("/table")
async def get_table_schema(request: TableNameRequest):
    try:
        async with pool.acquire() as conn:
            columns = await conn.fetch("""
                SELECT 
                    c.column_name,
                    c.data_type,
                    c.is_nullable,
                    c.column_default,
                    EXISTS (
                        SELECT 1 
                        FROM pg_constraint 
                        WHERE conrelid = c.table_name::regclass 
                        AND conkey[1] = c.ordinal_position
                        AND contype = 'p'
                    ) as is_primary,
                    EXISTS (
                        SELECT 1 
                        FROM pg_constraint 
                        WHERE conrelid = c.table_name::regclass 
                        AND conkey[1] = c.ordinal_position
                        AND contype = 'f'
                    ) as is_foreign
                FROM information_schema.columns c
                WHERE table_name = $1
            """, request.table_name)
            
            return [{
                "column_name": col['column_name'],
                "data_type": col['data_type'],
                "is_nullable": col['is_nullable'] == 'YES',
                "default_value": col['column_default'],
                "is_primary": col['is_primary'],
                "is_foreign": col['is_foreign']
            } for col in columns]
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.post("/run-sql")
async def execute_sql(request: SQLRequest):
    global pool
    try:
        async with pool.acquire() as conn:
            try:
                result = await conn.fetch(request.sql_command)
                return {
                    "status": "success",
                    "data": [dict(r) for r in result]
                }
            except asyncpg.exceptions.UndefinedTableError:
                await conn.execute(request.sql_command)
                return {"status": "success"}
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.post("/list", response_model=List[DirectoryItem])
async def list_directory(request: ListRequest):
    base_dir = Path(os.getcwd()).resolve()
    try:
        directories = []
        entry_points = request.entryPoints or ['']
        
        for ep in entry_points:
            start_path = safe_resolve_path(ep, base_dir)
            
            if not start_path.is_dir():
                raise HTTPException(
                    status_code=400,
                    detail=f"Entry point '{ep}' must be a directory"
                )
                
            directory = get_directory_structure(start_path, base_dir)
            directories.append(directory)

        if pool:
            try:
                async with pool.acquire() as conn:
                    tables = await conn.fetch(
                        "SELECT table_name FROM information_schema.tables "
                        "WHERE table_schema = 'e'"
                    )
                    
                    database_children = [
                        DirectoryItem(
                            name=table['table_name'],
                            path=f"Database/{table['table_name']}",
                            is_dir=False,
                            size=0
                        ) for table in tables
                    ]
                    
                    database_folder = DirectoryItem(
                        name="Database",
                        path="Database",
                        is_dir=True,
                        children=sorted(database_children, key=lambda x: x.name)
                    )
                    
                    directories.append(database_folder)
                    
                    # Nova lógica de ordenação
                    directories.sort(key=lambda x: (
                        1 if x.name.lower() == 'database' else 0,  # Força Database para o final
                        x.name.lower()  # Ordenação alfabética case-insensitive
                    ))
                    
            except Exception as e:
                print(f"Erro ao obter tabelas: {str(e)}")

        return directories
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/table-fields", response_model=List[FieldDetail])
async def get_table_fields(request: TableNameRequest):
    try:
        async with pool.acquire() as conn:
            # Verificar se a tabela existe
            table_exists = await conn.fetchval(
                "SELECT EXISTS ("
                "   SELECT 1 FROM information_schema.tables "
                "   WHERE table_schema = 'e' AND table_name = $1"
                ")", request.table_name
            )
            
            if not table_exists:
                raise HTTPException(status_code=404, detail="Table not found")

            # Obter detalhes das colunas
            columns = await conn.fetch(
                """
                SELECT 
                    c.column_name AS name,
                    c.data_type AS type,
                    c.is_nullable = 'YES' AS is_nullable,
                    c.column_default AS default,
                    EXISTS (
                        SELECT 1 
                        FROM information_schema.key_column_usage kcu
                        JOIN information_schema.table_constraints tc
                            ON tc.constraint_name = kcu.constraint_name
                        WHERE tc.constraint_type = 'PRIMARY KEY'
                            AND kcu.table_schema = 'e'
                            AND kcu.table_name = $1
                            AND kcu.column_name = c.column_name
                    ) AS is_primary,
                    fk.foreign_table,
                    fk.foreign_column
                FROM information_schema.columns c
                LEFT JOIN (
                    SELECT 
                        kcu.column_name,
                        ccu.table_name AS foreign_table,
                        ccu.column_name AS foreign_column
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage ccu
                        ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                        AND tc.table_schema = 'e'
                        AND tc.table_name = $1
                ) fk ON c.column_name = fk.column_name
                WHERE c.table_schema = 'e' 
                    AND c.table_name = $1
                ORDER BY c.ordinal_position
                """,
                request.table_name
            )

            return [{
                "name": col["name"],
                "type": col["type"],
                "is_nullable": col["is_nullable"],
                "default": col["default"],
                "is_primary": col["is_primary"],
                "is_foreign": col["foreign_table"] is not None,
                "foreign_table": col["foreign_table"],
                "foreign_column": col["foreign_column"]
            } for col in columns]

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/read-file")
async def read_file(request: FileRequest):
    try:
        base_dir = Path(os.getcwd()).resolve()
        file_path = safe_resolve_path(request.file_path, base_dir)
        if not file_path.exists():
            raise HTTPException(404, "File not found")
        if file_path.is_dir():
            raise HTTPException(400, "Path is directory")
        return {
            "filename": str(file_path.relative_to(base_dir)),
            "content": file_path.read_text(encoding='utf-8'),
            "size": file_path.stat().st_size,
            "success": True
        }
    except Exception as e:
        return {
            "filename": request.file_path,
            "success": False,
            "error": str(e)
        }

@app.post("/batch-read-files", response_model=List[FileContentResponse])
async def batch_read_files(request: BatchFileRequest):
    base_dir = Path(os.getcwd()).resolve()
    results = []
    for file_request in request.files:
        try:
            file_path = safe_resolve_path(file_request.file_path, base_dir)
            if not file_path.exists():
                raise FileNotFoundError()
            if file_path.is_dir():
                raise IsADirectoryError()
            content = file_path.read_text(encoding='utf-8')
            results.append({
                "filename": str(file_path.relative_to(base_dir)),
                "content": content,
                "size": file_path.stat().st_size,
                "success": True
            })
        except Exception as e:
            results.append({
                "filename": file_request.file_path,
                "success": False,
                "error": f"{type(e).__name__}: {str(e)}"
            })
    return results

@app.post("/file-operations", response_model=List[OperationResult])
async def batch_file_operations(operations: List[FileOperation]):
    base_dir = Path(os.getcwd()).resolve()
    results = []
    for op in operations:
        try:
            file_path = safe_resolve_path(op.filename, base_dir)
            result = {
                "filename": str(file_path.relative_to(base_dir)),
                "action": op.action,
                "success": True
            }
            if op.action == "u":
                if not file_path.exists():
                    raise FileNotFoundError()
                if not file_path.is_file():
                    raise IsADirectoryError()
                file_path.write_text(op.content or "", encoding="utf-8")
                result["message"] = "File updated"
            elif op.action == "n":
                if file_path.exists():
                    raise FileExistsError()
                file_path.parent.mkdir(parents=True, exist_ok=True)
                file_path.write_text(op.content or "", encoding="utf-8")
                result["message"] = "File created"
            elif op.action == "d":
                if not file_path.exists():
                    raise FileNotFoundError()
                if not file_path.is_file():
                    raise IsADirectoryError()
                file_path.unlink()
                result["message"] = "File deleted"
            else:
                raise ValueError("Invalid action")
        except Exception as e:
            result = {
                "filename": op.filename,
                "action": op.action,
                "success": False,
                "message": f"{type(e).__name__}: {str(e)}"
            }
        results.append(result)
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)