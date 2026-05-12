import ast
import inspect
import pytest
import face_detector
from face_detector import compute_axis_aligned_bbox

def test_bbox_computation():
    """
    ISSUE 3: Verify the core bounding box geometry logic.
    """
    points = [(10, 20), (50, 80), (30, 10), (60, 40)]
    # min_x=10, max_x=60 -> width=50
    # min_y=10, max_y=80 -> height=70
    # Expected: (min_x, min_y, width, height)
    assert compute_axis_aligned_bbox(points) == (10, 10, 50, 70)

def test_no_opencv_import():
    """
    ISSUE 3: Static analysis to ensure the project strictly avoids OpenCV (cv2).
    """
    source = inspect.getsource(face_detector)
    tree = ast.parse(source)
    
    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for name in node.names:
                imports.append(name.name)
        elif isinstance(node, ast.ImportFrom):
            imports.append(node.module)
            
    assert "cv2" not in imports, "OpenCV (cv2) detected in imports! Only PIL/MediaPipe are allowed."

def test_pil_used_for_drawing():
    """
    ISSUE 3: Ensure PIL/Pillow is the chosen library for image manipulation.
    """
    source = inspect.getsource(face_detector)
    assert any(x in source for x in ["PIL", "Pillow", "ImageDraw"]), "PIL/Pillow not found in face_detector.py"
