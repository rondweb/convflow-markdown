from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

from ..services.keycloak_manager import keycloak_user_manager
from ..routes.auth_keycloak import get_admin_user, get_current_user, User

router = APIRouter(prefix="/api/users", tags=["users"])

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    password: str = Field(..., min_length=8)
    roles: List[str] = []

class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    enabled: Optional[bool] = None
    attributes: Optional[dict] = None

class UserResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None

class UserListItem(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    enabled: bool
    roles: List[str] = []

@router.post("/create", response_model=UserResponse)
async def create_user(user_data: UserCreate, current_user: User = Depends(get_admin_user)):
    """
    Cria um novo usuário no Keycloak
    Requer permissão de administrador
    """
    try:
        user_dict = user_data.dict()
        result = keycloak_user_manager.create_user(user_dict)
        
        if result['success']:
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
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/list", response_model=List[UserListItem])
async def list_users(
    first: int = Query(0, ge=0),
    max_results: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_admin_user)
):
    """
    Lista usuários do Keycloak com paginação
    Requer permissão de administrador
    """
    try:
        users = keycloak_user_manager.list_users(first, max_results)
        
        result = []
        for user in users:
            # Obter roles do usuário
            roles = []
            if user.get('id'):
                user_roles = keycloak_user_manager.get_user_roles(user['id'])
                roles = [role['name'] for role in user_roles]
            
            result.append(UserListItem(
                id=user.get('id', ''),
                username=user.get('username', ''),
                email=user.get('email', ''),
                firstName=user.get('firstName', ''),
                lastName=user.get('lastName', ''),
                enabled=user.get('enabled', False),
                roles=roles
            ))
        
        return result
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao listar usuários: {str(e)}"
        )

@router.get("/search", response_model=UserListItem)
async def get_user_by_username_or_email(
    username: Optional[str] = None,
    email: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Busca usuário por username ou email
    """
    try:
        if not username and not email:
            raise HTTPException(
                status_code=400,
                detail="Informe username ou email para busca"
            )
        
        user = None
        if username:
            user = keycloak_user_manager.get_user_by_username(username)
        elif email:
            user = keycloak_user_manager.get_user_by_email(email)
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado"
            )
        
        # Obter roles do usuário
        roles = []
        user_roles = keycloak_user_manager.get_user_roles(user['id'])
        roles = [role['name'] for role in user_roles]
        
        return UserListItem(
            id=user.get('id', ''),
            username=user.get('username', ''),
            email=user.get('email', ''),
            firstName=user.get('firstName', ''),
            lastName=user.get('lastName', ''),
            enabled=user.get('enabled', False),
            roles=roles
        )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar usuário: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserListItem)
async def get_user_by_id(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Busca usuário por ID
    """
    try:
        user = keycloak_user_manager.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado"
            )
        
        # Obter roles do usuário
        roles = []
        user_roles = keycloak_user_manager.get_user_roles(user_id)
        roles = [role['name'] for role in user_roles]
        
        return UserListItem(
            id=user.get('id', ''),
            username=user.get('username', ''),
            email=user.get('email', ''),
            firstName=user.get('firstName', ''),
            lastName=user.get('lastName', ''),
            enabled=user.get('enabled', False),
            roles=roles
        )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar usuário: {str(e)}"
        )

@router.put("/update/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(get_admin_user)
):
    """
    Atualiza dados de um usuário
    Requer permissão de administrador
    """
    try:
        update_dict = {k: v for k, v in user_data.dict().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(
                status_code=400,
                detail="Nenhum dado para atualizar foi fornecido"
            )
        
        result = keycloak_user_manager.update_user(user_id, update_dict)
        
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

@router.delete("/delete/{user_id}", response_model=UserResponse)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Remove um usuário
    Requer permissão de administrador
    """
    try:
        result = keycloak_user_manager.delete_user(user_id)
        
        if result['success']:
            return UserResponse(
                success=True,
                message="Usuário removido com sucesso",
                user_id=user_id
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Erro ao remover usuário: {result['error']}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/assign-role/{user_id}/{role_name}", response_model=UserResponse)
async def assign_role(
    user_id: str,
    role_name: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Atribui uma role a um usuário
    Requer permissão de administrador
    """
    try:
        result = keycloak_user_manager.assign_role_to_user(user_id, role_name)
        
        if result['success']:
            return UserResponse(
                success=True,
                message=f"Role '{role_name}' atribuída com sucesso",
                user_id=user_id
            )
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

@router.delete("/remove-role/{user_id}/{role_name}", response_model=UserResponse)
async def remove_role(
    user_id: str,
    role_name: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Remove uma role de um usuário
    Requer permissão de administrador
    """
    try:
        result = keycloak_user_manager.remove_role_from_user(user_id, role_name)
        
        if result['success']:
            return UserResponse(
                success=True,
                message=f"Role '{role_name}' removida com sucesso",
                user_id=user_id
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Erro ao remover role: {result['error']}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/roles/list", response_model=List[dict])
async def list_roles(current_user: User = Depends(get_admin_user)):
    """
    Lista as roles disponíveis no realm
    Requer permissão de administrador
    """
    try:
        roles = keycloak_user_manager.get_available_roles()
        return roles
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao listar roles: {str(e)}"
        )
