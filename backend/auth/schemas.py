from pydantic import BaseModel

class TokenData(BaseModel):
    sub: int | None = None
