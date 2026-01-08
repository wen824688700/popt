from hypothesis import given
from hypothesis import strategies as st

from app.services.quota_manager import QuotaManager


@given(st.text(min_size=1, max_size=20))
def test_quota_key_contains_user_id(user_id: str):
    qm = QuotaManager()
    key = qm._get_user_quota_key(user_id)
    assert user_id in key

