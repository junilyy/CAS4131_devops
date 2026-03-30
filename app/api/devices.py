from fastapi import APIRouter, HTTPException
from app.data.dummy_data import usage_by_device

router = APIRouter()


@router.get(
    "/devices/{device_id}/usage",
    summary="특정 가전의 상세 사용 현황 조회",
    description="device_id에 해당하는 가전의 전원 상태, 누적 사용 시간, 주간 사용 추이 등 상세 현황을 반환합니다.",
    responses={
        200: {
            "description": "사용 현황 반환 성공",
            "content": {
                "application/json": {
                    "example": {
                        "deviceId": "D001",
                        "deviceName": "LG OLED evo C4",
                        "powerStatus": "On",
                        "lastUsedAt": "2026-03-22 10:10:00",
                        "totalUsageHours": 152,
                        "weeklyUsageCount": 18,
                        "healthStatus": "Normal",
                        "remark": "Streaming service active",
                        "weeklyUsageTrend": [2, 3, 1, 4, 2, 3, 3],
                    }
                }
            },
        },
        404: {"description": "해당 device_id가 존재하지 않음"},
    },
)
def get_device_usage(device_id: str):
    # 1. usage_by_device에서 device_id로 조회
    # 2. 존재하면 사용 현황 데이터 반환
    # 3. 존재하지 않으면 HTTPException(status_code=404) 발생
    if device_id not in usage_by_device:
        raise HTTPException(status_code=404)
    return usage_by_device[device_id]