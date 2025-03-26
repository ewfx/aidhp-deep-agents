#!/usr/bin/env python3
"""
Script to test huggingface_hub and transformers compatibility
"""

import sys
import os
import importlib

# Print Python version
print(f"Python version: {sys.version}")

# List installed packages related to huggingface
try:
    import pip
    installed_packages = [pkg.key for pkg in pip._internal.metadata.get_environment_dist_info() if pkg.key]
    hf_packages = [pkg for pkg in installed_packages if "huggingface" in pkg or "transformers" in pkg]
    print("\nInstalled Hugging Face related packages:")
    for pkg in hf_packages:
        module = importlib.import_module(pkg)
        version = getattr(module, "__version__", "unknown")
        print(f"  - {pkg}: {version}")
except Exception as e:
    print(f"Error listing packages: {e}")

# Try importing from huggingface_hub
print("\nHuggingFace Hub imports:")
try:
    import huggingface_hub
    print(f"  huggingface_hub version: {huggingface_hub.__version__}")
    print("\nAvailable functions in huggingface_hub:")
    hub_functions = [name for name in dir(huggingface_hub) if not name.startswith('_')]
    print(f"  {', '.join(hub_functions[:10])}...")
except Exception as e:
    print(f"  Error importing huggingface_hub: {e}")

# Try importing specific functions that might have changed
print("\nTrying to import specific functions:")
try:
    # Try importing cached_download which is causing the error
    from huggingface_hub import cached_download
    print("  ✓ Successfully imported cached_download")
except ImportError:
    print("  × Failed to import cached_download")
    print("  This function may have been renamed or moved in newer versions")
    # Try alternatives
    try:
        from huggingface_hub import hf_hub_download
        print("  ✓ Successfully imported hf_hub_download (possible alternative)")
    except ImportError:
        print("  × Failed to import hf_hub_download")

# Try importing transformers
print("\nTransformers imports:")
try:
    import transformers
    print(f"  transformers version: {transformers.__version__}")
    # Check which huggingface_hub is used by transformers
    transformers_hf = transformers._import_structure.get("huggingface_hub", [])
    print(f"  transformers imports from huggingface_hub: {transformers_hf}")
except Exception as e:
    print(f"  Error importing transformers: {e}")

print("\nConclusion:")
print("The issue is likely due to a version mismatch between transformers and huggingface_hub.")
print("The transformers package is trying to import cached_download from huggingface_hub,")
print("but this function has been renamed or moved in newer versions of huggingface_hub.") 