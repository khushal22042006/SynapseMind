# test_backend.py
print("Testing FastAPI 0.100.0 + Pydantic 1.10.13...")

try:
    import pydantic
    import fastapi
    
    print(f"✅ Pydantic version: {pydantic.__version__}")
    print(f"✅ FastAPI version: {fastapi.__version__}")
    
    # Test Pydantic
    from pydantic import BaseModel
    
    class TestModel(BaseModel):
        name: str
        age: int = 25
    
    obj = TestModel(name="SynapseMind")
    print(f"✅ Pydantic works: {obj}")
    
    # Test FastAPI
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/test")
    def test_route():
        return {"message": "FastAPI works!"}
    
    print("✅ FastAPI app created successfully!")
    print("\n🎉 Ready to run the backend!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()