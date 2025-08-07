from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import requests
from ..services.keycloak_user_manager import KeycloakUserManager

router = APIRouter(prefix="/api/users", tags=["users"])

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    password: str

class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None

# Inicializar gerenciador do Keycloak
keycloak_manager = KeycloakUserManager()

@router.post("/create", response_model=UserResponse)
async def create_user(user_data: UserCreate):
    """
    Cria um novo usuário no Keycloak
    """
    try:
        user_dict = user_data.dict()
        result = keycloak_manager.create_user(user_dict)
        
        if result['success']:
            # Atribuir role padrão de usuário
            role_result = keycloak_manager.assign_role_to_user(
                result['user_id'], 
                'default-roles-convflow'  # Role padrão do realm
            )
            
            return UserResponse(
                success=True,
                message="Usuário criado com sucesso",
                user_id=result['user_id']
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Erro ao criar usuário: {result['error']}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/search/{username}")
async def get_user_by_username(username: str):
    """
    Busca usuário por username
    """
    try:
        user = keycloak_manager.get_user_by_username(username)
        
        if user:
            return {
                "success": True,
                "user": {
                    "id": user['id'],
                    "username": user['username'],
                    "email": user.get('email'),
                    "firstName": user.get('firstName'),
                    "lastName": user.get('lastName'),
                    "enabled": user.get('enabled'),
                    "emailVerified": user.get('emailVerified')
                }
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar usuário: {str(e)}"
        )

@router.put("/update/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_data: UserUpdate):
    """
    Atualiza dados de um usuário
    """
    try:
        update_dict = {k: v for k, v in user_data.dict().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(
                status_code=400,
                detail="Nenhum dado para atualizar foi fornecido"
            )
        
        result = keycloak_manager.update_user(user_id, update_dict)
        
        if result['success']:
            return UserResponse(
                success=True,
                message="Usuário atualizado com sucesso",
                user_id=user_id
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Erro ao atualizar usuário: {result['error']}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/assign-role/{user_id}/{role_name}")
async def assign_role(user_id: str, role_name: str):
    """
    Atribui uma role a um usuário
    """
    try:
        result = keycloak_manager.assign_role_to_user(user_id, role_name)
        
        if result['success']:
            return {
                "success": True,
                "message": f"Role '{role_name}' atribuída com sucesso"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Erro ao atribuir role: {result['error']}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )
