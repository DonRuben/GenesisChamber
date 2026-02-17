# Expert Photos Directory

Place your expert photos in this directory following the naming convention defined in `experts.toml`.

## Photo Requirements:

1. **File Format**: JPEG (.jpeg) or PNG (.png)
2. **Recommended Size**: 200x200px minimum (square aspect ratio works best)
3. **File Names**: Must match the filenames in experts.toml (e.g., 1.jpeg, 2.jpeg, etc.)

## Adding/Modifying Experts:

1. Add your photo file to this directory
2. Update `experts.toml` with the expert's information
3. The system will automatically detect and use the new photos

## Example Structure:
```
expert_photos/
├── experts.toml    # Configuration file
├── 1.jpeg         # Steve Jobs
├── 2.jpeg         # Elon Musk
├── 3.jpeg         # Jeff Bezos
├── 4.jpeg         # Warren Buffett
├── 5.jpeg         # Satya Nadella
└── ...            # More experts
```

The slot machine will automatically adjust its width based on the number of photos available.