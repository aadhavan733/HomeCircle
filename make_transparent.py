from PIL import Image

def make_transparent(image_path, output_path, threshold=20):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if the pixel is dark (black background)
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            newData.append((255, 255, 255, 0)) # Fully transparent
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    make_transparent("public/logo.jpg", "public/logo.png", threshold=30)
