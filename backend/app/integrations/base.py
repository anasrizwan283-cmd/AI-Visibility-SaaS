from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseIntegration(ABC):
    """
    Base class for all external tool integrations.
    """

    name: str = ""
    display_name: str = ""

    @abstractmethod
    async def test_connection(self, credentials: Dict[str, Any]) -> bool:
        """
        Test whether the provided credentials are valid.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_data(
        self,
        credentials: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Fetch data from the external integration.
        """
        raise NotImplementedError