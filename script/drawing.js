// Add an event listener to track mouse movement and log cursor position (commented out for now)
document.addEventListener('mousemove', function (e) {
    var mx = e.clientX;
    var my = e.clientY;
    // console.log('Cursor position: ', mx, my); // Uncomment for debugging
});
var width;
var height;
var dheight;
var drawings = {
    "pictures/Who's on First.png": [],
    "pictures/Wires.png": [],
    "pictures/Simon Says.png": [],
    "pictures/Keypad.png": [],
    "pictures/Complicated Wires.png": [],
    "pictures/Memory.png": [],
    "pictures/Who's%20on%20First.png": []
};;

// Wait for the DOM to fully load before executing
document.addEventListener('DOMContentLoaded', function () {
    const templateElement = document.getElementById('Template');
    const computedStyle = getComputedStyle(templateElement);

    // Extract width and height from the computed styles of the template element
    width = parseInt(computedStyle.width, 10);
    height = parseInt(computedStyle.height, 10);
    dheight = height*2;
    // Log the dimensions for debugging
    console.log(width, height);

    // Set canvas dimensions to match the template element
    canvas.width = width;
    canvas.height = height;
});

// Initialize canvas elements and their contexts
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// Load and draw the first image onto the first canvas
var img = new Image();
img.onload = function () {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    //loadDrawings(); // Load any existing drawings after the image is drawn
    drawDrawings(drawings); // Load any existing drawings after the image is drawn
};
img.src = "pictures/Wires.png";

// Variables for drawing
var painting = false; // Tracks whether the user is currently drawing
var linec = "round"; // Line cap style
var stokestyle = "red"; // Stroke color
var linewidth = 20; // Line width
var tempered = false;
// Start drawing when the mouse is pressed
function startDraw(e) {
    painting = true;
    draw(e); // Call draw to start the stroke
    if(tempered){
        
        tempered = false;
    }
}

// Stop drawing when the mouse is released
function endDraw() {
    painting = false;
    ctx.beginPath(); // Reset the path for the canvas
    const currentImageKey = img.src.split(document.location.host + "/")[1];
    if (drawings[currentImageKey]) {
        drawings[currentImageKey].push(null);
    }
}
// Draw on the first canvas
function draw(e) {
    if (!painting) return;

    // Set drawing styles
    ctx.lineWidth = linewidth;
    ctx.lineCap = linec;
    ctx.strokeStyle = stokestyle;

    // Calculate the mouse position relative to the canvas
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    // Draw the line
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Ensure the current image key exists in savedDrawings
    const currentImageKey = img.src.split(document.location.host + "/")[1];
    if (!drawings[currentImageKey]) {
        drawings[currentImageKey] = [];
    }

    // Save the current point to the drawings for the current image
    drawings[currentImageKey].push([linewidth, linec, stokestyle, x, y, true]);

}

function saveDrawings(d) {
    for(const key in d) {
        var save=[];
        for(let i = 0; i < d[key].length; i++){
            if(d[key][i] === null){
                save.push(null);
            }else if(d[key][i][5] === true){
                save.push(d[key][i]);
            }
        }
        d[key] = save;
    }

}
function drawDrawings(drawings) {
    // Clear the canvas before loading drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image again
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get the current image key
    const currentImageKey = img.src.split(document.location.host + "/")[1];

    // Check if there are saved drawings for the current image
    if (drawings[currentImageKey] && drawings[currentImageKey].length > 0) {
        ctx.beginPath(); // Start a new path for the current image
        for (let i = 0; i < drawings[currentImageKey].length; i++) {
            const point = drawings[currentImageKey][i];

            if (point === null) {
                // If a null is encountered, stroke the current path and start a new one
                ctx.stroke();
                ctx.beginPath();
            } else {
                const [linewidth, linec, stokestyle, x, y, visible] = point;

                if (!visible) {
                    continue; // Skip invisible points
                }

                // Set drawing styles
                ctx.lineWidth = linewidth;
                ctx.lineCap = linec;
                ctx.strokeStyle = stokestyle;

                if (i === 0 || drawings[currentImageKey][i - 1] === null) {
                    // Move to the first point without drawing
                    ctx.moveTo(x, y);
                } else {
                    // Draw a line to the next point
                    ctx.lineTo(x, y);
                }
            }
        }
        ctx.stroke(); // Apply the stroke to draw the final path
    }
}
function undo() {
    const currentImageKey = img.src.split(document.location.host + "/")[1];
    let didthings = false;

    // Loop backward through the drawings array
    for (let i = drawings[currentImageKey].length - 1; i >= 0; i--) {
        if (drawings[currentImageKey][i] === null && didthings) {
            // Stop undoing when a null is encountered after undoing points
            break;
        } else if (drawings[currentImageKey][i] !== null && drawings[currentImageKey][i][5] === true) {
            // Mark the point as invisible
            drawings[currentImageKey][i][5] = false;
            didthings = true;
        }
    }
    // Redraw the canvas to reflect the undo
    drawDrawings(drawings);
    tempered = true;

}
function redo(){const currentImageKey = img.src.split(document.location.host + "/")[1];
    let didthings = false;
    for (let i = 0; i < drawings[currentImageKey].length; i++) {
        if(drawings[currentImageKey][i] === null && didthings){
            break;
        }else if(drawings[currentImageKey][i] !== null && drawings[currentImageKey][i][5] === false){
            drawings[currentImageKey][i][5] = true;
            didthings = true;
        }
    }    
    drawDrawings(drawings); // Load the drawings again to reflect the undo
    tempered = true;
}
function clearDrawings() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clear the drawings for the current image
    drawings[img.src.split(document.location.host + "/")[1]] = [];

    // Redraw the image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}
function clearAllDrawings() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clear all drawings for all images
    drawings = {
        "pictures/Who's on First.png": [],
        "pictures/Wires.png": [],
        "pictures/Simon Says.png": [],
        "pictures/Keypad.png": [],
        "pictures/Complicated Wires.png": [],
        "pictures/Memory.png": [],
        "pictures/Who's%20on%20First.png": []
    };

    // Redraw the image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mousemove', draw);
function change(name) {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update the source of the first image
    img.src = "pictures/" + name + ".png";

    // Adjust canvas height if necessary
    if (name === "Who's on First" || name === "Who's%20on%20First") {
        canvas.height = dheight;
    } else {
        canvas.height = height;
    }
    canvas.width = width;

    // Load any existing drawings for the new image
    drawDrawings(drawings);
}
