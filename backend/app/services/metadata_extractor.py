from PIL import Image, ExifTags
from typing import Dict, Any

def extract_image_metadata(image: Image.Image) -> Dict[str, Any]:
    """Extracts actual EXIF metadata and provides honest provenance status."""
    
    exif_fields = {}
    if hasattr(image, 'getexif'):
        exif = image.getexif()
        if exif is not None:
            for tag_id, value in exif.items():
                tag = ExifTags.TAGS.get(tag_id, tag_id)
                # Filter to human-readable strings/numbers for safe frontend display
                if isinstance(value, (str, int, float)) and len(str(value).strip()) > 0:
                    exif_fields[str(tag)] = str(value).strip()
    
    if exif_fields:
        # Build a readable summary of important fields
        summary_parts = []
        if 'Make' in exif_fields or 'Model' in exif_fields:
            summary_parts.append(f"{exif_fields.get('Make', '')} {exif_fields.get('Model', '')}".strip())
        if 'LensModel' in exif_fields:
            summary_parts.append(exif_fields['LensModel'])
        if 'ExposureTime' in exif_fields:
            summary_parts.append(f"Exp: {exif_fields['ExposureTime']}")
        if 'ISOSpeedRatings' in exif_fields:
            summary_parts.append(f"ISO: {exif_fields['ISOSpeedRatings']}")
            
        exif_status = "available"
        exif_summary = " | ".join(summary_parts) if summary_parts else "Basic EXIF metadata found"
    else:
        exif_status = "not_available"
        exif_summary = "No camera metadata available"

    return {
        "provenance": {
            "c2pa": {
                "status": "not_present",
                "label": "Not present"
            },
            "exif": {
                "status": exif_status,
                "label": exif_summary,
                "fields": exif_fields
            },
            "editingHistory": {
                "status": "not_determined",
                "label": "Not determined from available metadata"
            },
            "source": {
                "status": "uploaded_directly",
                "label": "Uploaded directly to SignalScope"
            }
        },
        "generatorAttribution": {
            "status": "not_available",
            "reason": "The current classifier determines REAL vs AI but does not identify the image generator."
        },
        "captionConsistency": {
            "status": "not_evaluated",
            "reason": "No independent image-caption consistency analysis is available."
        }
    }
