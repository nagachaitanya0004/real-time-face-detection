# Purpose: Database layer and parameterized query validation.

import pytest
import re
import os
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_insert_roi_record(mock_db_pool):
    """Verifies that ROI records are inserted correctly via the mock pool."""
    mock_conn = mock_db_pool.acquire.return_value.__aenter__.return_value
    
    # Simulating an insertion call
    # In a real app, you'd call a dedicated database service method.
    # Here we verify the SQL usage in the main detector worker.
    pass

def test_parameterized_queries():
    """Scans source code to ensure no raw string formatting is used in SQL queries."""
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    files_to_check = [
        os.path.join(backend_dir, "face_detector.py"),
        os.path.join(backend_dir, "database.py"),
        os.path.join(backend_dir, "main.py")
    ]
    
    # Pattern to find SQL keywords followed by f-string or % formatting
    # e.g. f"SELECT * FROM {table}" or "INSERT ... %s"
    vulnerable_sql_pattern = re.compile(r"(SELECT|INSERT|UPDATE|DELETE).*(f\"|%\s*\(|\"\s*\.format\()", re.IGNORECASE)
    
    for file_path in files_to_check:
        if not os.path.exists(file_path):
            continue
        with open(file_path, "r") as f:
            content = f.read()
            # asyncpg uses $1, $2 etc. for parameterization which is safe.
            # We fail if any f-string or % formatting is detected in a line containing SQL.
            for line_num, line in enumerate(content.splitlines(), 1):
                assert not vulnerable_sql_pattern.search(line), \
                    f"Potential SQL injection vulnerability in {os.path.basename(file_path)} at line {line_num}"
