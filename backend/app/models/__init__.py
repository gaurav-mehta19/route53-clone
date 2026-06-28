"""Models package — re-exports all ORM classes so `import app.models` is enough.

`init_db()` relies on this import to register tables on the metadata.
"""

from app.models.session import UserSession
from app.models.user import User

__all__ = ["User", "UserSession"]
