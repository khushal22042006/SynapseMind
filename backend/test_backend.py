# test_fastapi.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class TestModel(BaseModel):
    name: str
    value: int

@app.get("/")
def read_root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)