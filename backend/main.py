from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from typing import List
import os
from bson.objectid import ObjectId
import json

# Definir el modelo de producto
class Producto(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    stock: int

# Crear FastAPI app
app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Obtener la URI de MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:password@mongo:27017/catalogo?authSource=admin")

# Inicializar las variables globalmente
client = None
db = None
productos_collection = None

try:
    # Conectar a MongoDB
    client = MongoClient(MONGO_URI)
    db = client["catalogo"]
    productos_collection = db["productos"]
    client.admin.command('ping')
    print("¡Conectado exitosamente a MongoDB!")
except Exception as e:
    print(f"Error al conectar a MongoDB: {e}")
    raise

@app.post("/productos/")
async def agregar_producto(request: Request):
    try:
        body = await request.body()
        print("Body recibido:", body.decode())
        producto_data = json.loads(body.decode())
        print("JSON parseado:", producto_data)
        producto = Producto(**producto_data)
        resultado = productos_collection.insert_one(producto.dict())
        return {
            "mensaje": "Producto creado exitosamente",
            "id": str(resultado.inserted_id),
            "producto": producto.dict()
        }
    except json.JSONDecodeError as e:
        print(f"Error al decodificar JSON: {e}")
        raise HTTPException(status_code=400, detail=f"Error al parsear JSON: {str(e)}")
    except Exception as e:
        print(f"Error: {type(e).__name__} - {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/productos/", response_model=List[dict])
async def obtener_productos():
    try:
        productos = []
        for producto in productos_collection.find():
            producto["_id"] = str(producto["_id"])
            productos.append(producto)
        return productos
    except Exception as e:
        print(f"Error al obtener productos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/productos/{producto_id}")
async def eliminar_producto(producto_id: str):
    try:
        _id = ObjectId(producto_id)
        resultado = productos_collection.delete_one({"_id": _id})
        if resultado.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return {"mensaje": "Producto eliminado exitosamente"}
    except Exception as e:
        print(f"Error al eliminar producto: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/productos/{producto_id}")
async def actualizar_producto(producto_id: str, request: Request):
    try:
        _id = ObjectId(producto_id)
        body = await request.body()
        producto_data = json.loads(body.decode())
        producto = Producto(**producto_data)
        
        resultado = productos_collection.update_one(
            {"_id": _id},
            {"$set": producto.dict()}
        )
        
        if resultado.matched_count == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
            
        producto_actualizado = productos_collection.find_one({"_id": _id})
        if producto_actualizado:
            producto_actualizado["_id"] = str(producto_actualizado["_id"])
            
        return {
            "mensaje": "Producto actualizado exitosamente",
            "producto": producto_actualizado
        }
    except json.JSONDecodeError as e:
        print(f"Error al decodificar JSON: {e}")
        raise HTTPException(status_code=400, detail=f"Error al parsear JSON: {str(e)}")
    except Exception as e:
        print(f"Error: {type(e).__name__} - {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "API de Catálogo funcionando!"}