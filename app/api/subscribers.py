from fastapi import APIRouter, HTTPException
from app.data.dummy_data import subscribers, devices_by_user

router = APIRouter()


# =============================================================================
# TODO [요구사항 #1]: GET /api/subscribers
# =============================================================================
# 전체 구독 사용자 목록을 반환하는 엔드포인트를 구현하세요.
#
# - HTTP Method: GET
# - Path: /subscribers
# - 응답: subscribers 리스트 전체를 JSON으로 반환
# - 참고: dummy_data.py의 subscribers 변수를 활용하세요.
# =============================================================================
@router.get(
    "/subscribers",
    summary="전체 구독 사용자 목록 조회",
    description="등록된 모든 구독 사용자의 정보를 리스트로 반환합니다.",
    responses={
        200: {
            "description": "구독 사용자 목록 반환 성공",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "userId": "U001",
                            "name": "Kim Minsoo",
                            "organization": "Yonsei University",
                            "plan": "Premium",
                            "status": "Active",
                            "deviceCount": 2,
                        }
                    ]
                }
            },
        }
    },
)
def get_subscribers():
    # subscribers 리스트 전체를 반환
    return subscribers

# =============================================================================
# TODO [요구사항 #2]: GET /api/subscribers/{user_id}/devices
# =============================================================================
# 특정 사용자의 가전 목록을 반환하는 엔드포인트를 구현하세요.
#
# - HTTP Method: GET
# - Path: /subscribers/{user_id}/devices
# - Path Parameter: user_id (str)
# - 정상 응답: 해당 사용자의 디바이스 리스트 반환
# - 사용자가 존재하지 않는 경우: HTTPException(status_code=404) 반환
# - 가전이 없는 경우: 빈 리스트([]) 반환
# - 참고: devices_by_user 딕셔너리를 활용하세요.
# =============================================================================
@router.get(
    "/subscribers/{user_id}/devices",
    summary="특정 사용자의 가전 목록 조회",
    description="user_id에 해당하는 구독자의 등록 가전 목록을 반환합니다. 가전이 없으면 빈 리스트를 반환합니다.",
    responses={
        200: {
            "description": "가전 목록 반환 성공",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "deviceId": "D001",
                            "type": "TV",
                            "model": "LG OLED evo C4",
                            "location": "Dormitory",
                            "status": "Online",
                            "lastSeen": "2026-03-22 10:20:00",
                        }
                    ]
                }
            },
        },
        404: {"description": "해당 user_id가 존재하지 않음"},
    },
)
def get_devices_by_user(user_id: str):
    # 1. subscribers 리스트에서 user_id가 존재하는지 확인
    # 2. 존재하면 devices_by_user에서 해당 사용자의 디바이스 목록 반환
    # 3. 존재하지 않으면 HTTPException(status_code=404) 발생
    if not any(s["userId"] == user_id for s in subscribers):
        raise HTTPException(status_code=404)
    return devices_by_user.get(user_id, [])