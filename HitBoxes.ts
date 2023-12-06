function isPositionInHitbox(x: number, y: number) {
    for (let hitbox of hitboxes08) {
        let rect = hitbox.rect;
        if (x >= rect[0] && y >= rect[1] && x <= rect[2] && y <= rect[3]) {
            return hitbox.name
        }
    }
    return null
}
enum FillType {
    Border,
    FloodFill,
    Diagonal_Pattern_Fill
}
let hitboxes08: { name: string, rect: number[] }[] = []
//% Groupes="['Hitboxes']"
namespace HitBox {
    // function to create a new hitbox
    //% block="create hitbox with name $name at x$x1 y$y1 to x$x2 y$y2"
    //% name.shadow="HitboxNameList2"
    //% group="Hitboxes"
    export function createHitbox(x1: number, y1: number, x2: number, y2: number, name: string): void {
        hitboxes08.push({ name: name, rect: [x1, y1, x2, y2] });
    }
    // function to find if a position is in a Hitbox or not
    //% block="is position x$x y$y within hitbox"
    //% group="Hitboxes"
    export function IsWithinHitbox(x: number, y: number) {
        if (isPositionInHitbox(x, y) != "") {
            return true
        } else {
            return false
        }
    }
    // function to find wht Hitbox is a position in
    //% block="what hitbox is position in x$x y$y"
    //% group="Hitboxes"
    export function WhatHitboxIsMouseIn(x: number, y: number) {
        return isPositionInHitbox(x, y)
    }
    // Function to move Hitboxes
    //% block="Move Hitbox wit name$name by x$xOffset y$yOffset"
    //% group="Hitboxes"
    //% name.shadow="HitboxNameList2"
    export function moveHitboxesByName(name: string, xOffset: number, yOffset: number): void {
        for (let i = 0; i < hitboxes08.length; i++) {
            if (hitboxes08[i].name == name) {
                hitboxes08[i].rect[0] += xOffset; // Update x1 position
                hitboxes08[i].rect[1] += yOffset; // Update y1 position
                hitboxes08[i].rect[2] += xOffset; // Update x2 position
                hitboxes08[i].rect[3] += yOffset; // Update y2 position
            }
        }
    }
    // function to create a dropdown under the string with all the names of hiboxes
    //% block="$name"
    //% blockId=HitboxNameList2
    //% blockHidden=true shim=TD_ID
    //% name.fieldEditor="autocomplete" name.fieldOptions.decompileLiterals=true
    //% name.fieldOptions.key="HitboxNameList2"
    export function HitboxNameList(name: string) {
        return name
    }
    // Function to fill the polygon based on the specified filling type and color
    //% block="name$hitboxName color$color fill$fillingType"
    //% hitboxName.shadow="HitboxNameList2"
    export function fillHitboxPolygon(hitboxName: string, color: number, fillingType: FillType): void {
        let hitboxesToFill = hitboxes08.filter((hb) => hb.name === hitboxName); // Get the hitboxes with the specified name
        let filledPixels: { [key: string]: boolean } = {}; // Track filled pixels to prevent duplicate filling

        for (let hb of hitboxesToFill) {
            let rect = hb.rect;
            if (fillingType == FillType.Border) {
                for (let x = rect[0]; x <= rect[2]; x++) {
                    fillBorderPixelIfValid(x, rect[1], hitboxName, color, filledPixels);
                    fillBorderPixelIfValid(x, rect[3], hitboxName, color, filledPixels);
                }
                for (let y = rect[1] + 1; y < rect[3]; y++) {
                    fillBorderPixelIfValid(rect[0], y, hitboxName, color, filledPixels);
                    fillBorderPixelIfValid(rect[2], y, hitboxName, color, filledPixels);
                }
            } else if (fillingType == FillType.FloodFill) {
                setHitboxColor(hitboxName, color)
            } else if (fillingType == FillType.Diagonal_Pattern_Fill) {
                fillHitboxWithCustomPattern(hitboxName, DiagonalImage)
            }
        }
    }
}


// helper Function to fill every hitbox with a specified name to the specified color
function setHitboxColor(name: string, color: number): void {
    let hitboxesToFill = hitboxes08.filter((hb) => hb.name === name); // Get the hitboxes with the specified name

    for (let hb of hitboxesToFill) {
        let rect = hb.rect;
        for (let y = rect[1]; y <= rect[3]; y++) {
            for (let x = rect[0]; x <= rect[2]; x++) {
                screen.setPixel(x, y, color); // Set the pixel to the specified color
            }
        }
    }
}

// Helper function to fill the hitbox with a custom pattern represented by an image
function fillHitboxWithCustomPattern(hitboxName: string, patternImage: Image): void {
    let hitboxesToFill = hitboxes08.filter((hb) => hb.name === hitboxName); // Get the hitboxes with the specified name
    let patternWidth = patternImage.width;
    let patternHeight = patternImage.height;

    for (let hb of hitboxesToFill) {
        let rect = hb.rect;
        for (let y = 0; y < screen.height; y++) {
            for (let x = 0; x < screen.width; x++) {
                let color = patternImage.getPixel((rect[0] + x) % patternWidth, (rect[1] + y) % patternHeight);
                if (rect[0] + x <= rect[2] && rect[1] + y <= rect[3]) {
                    scene.backgroundImage().setPixel(rect[0] + x, rect[1] + y, color); // Set the pixel to the specified color from the pattern image
                }
            }
        }
    }
}



// Helper function to fill a border pixel if it's valid
function fillBorderPixelIfValid(x: number, y: number, hitboxName: string, color: number, filledPixels: { [key: string]: boolean }): void {
    if (isBorderPixelValid(x, y, hitboxName)) {
        let key = `${x},${y}`;
        if (!filledPixels[key]) {
            scene.backgroundImage().setPixel(x, y, color);
            filledPixels[key] = true;
        }
    }
}

// Helper function to check if a border pixel is valid
function isBorderPixelValid(x: number, y: number, hitboxName: string): boolean {
    // Check if at least one of the four sides of the pixel is not within a hitbox with the same name or within any hitbox at all
    return !isPointWithinHitbox(x, y - 1, hitboxName) || !isPointWithinHitbox(x, y + 1, hitboxName) ||
        !isPointWithinHitbox(x - 1, y, hitboxName) || !isPointWithinHitbox(x + 1, y, hitboxName);
}

// Helper Function to check if a point is within a hitbox with the specified name
function isPointWithinHitbox(x: number, y: number, hitboxName: string): boolean {
    if (isPositionInHitbox(x, y) == hitboxName) {return true} else {return false}
}

// Helper function to check if a point is within a rectangle
function isPointInRect(x: number, y: number, rect: [number, number, number, number]): boolean {
    return x >= rect[0] && x <= rect[2] && y - scene.cameraProperty(CameraProperty.Y) >= rect[1] && y <= rect[3];
}
