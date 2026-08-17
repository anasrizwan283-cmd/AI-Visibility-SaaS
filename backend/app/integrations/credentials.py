import os
import json
from typing import Any, Dict

from dotenv import load_dotenv
from cryptography.fernet import Fernet


# Load variables from backend/.env
load_dotenv()


class CredentialManager:
    """
    Secure manager for encrypting and decrypting integration credentials.
    """

    def __init__(self):
        self.encryption_key = os.getenv(
            "INTEGRATION_ENCRYPTION_KEY"
        )

        if not self.encryption_key:
            raise RuntimeError(
                "INTEGRATION_ENCRYPTION_KEY is not configured."
            )

        self.fernet = Fernet(
            self.encryption_key.encode()
        )

    def encrypt(
        self,
        credentials: Dict[str, Any]
    ) -> str:
        """
        Encrypt credentials before storing them.
        """

        payload = json.dumps(
            credentials
        ).encode()

        encrypted = self.fernet.encrypt(
            payload
        )

        return encrypted.decode()

    def decrypt(
        self,
        encrypted_credentials: str
    ) -> Dict[str, Any]:
        """
        Decrypt stored credentials when needed.
        """

        decrypted = self.fernet.decrypt(
            encrypted_credentials.encode()
        )

        return json.loads(
            decrypted.decode()
        )