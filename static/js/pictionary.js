// Adapted from Ricardo Cabello's GitHub gist: https://gist.github.com/mrdoob/718743

const LINE_WIDTH = 6;
const STROKE_STYLE = '#000000';

let canvas;
let context;
const mouse = { x: 0, y: 0 };

/**
 * Set stroke width when the user 
 * @param {object} event
 */
const setStrokeWidth = event => {
    context.lineWidth = event.target.value;
};

/**
 * Set stroke color when the user chooses from the input
 * @param {object} event
 */
const setStrokeStyle = event => {
    context.strokeStyle = event.target.value;
};

/**
 * Set the line cap style when the user chooses a new radio option
 * @param {object} event 
 */
const setLineCapStyle = event => {
    context.lineCap = event.target.value;
};

/**
 * Set the last mouse position using an event object
 * @param {object} event 
 */
const setMousePos = event => {
    const { x, y } = getCanvasPosition(event);
    mouse.x = x;
    mouse.y = y;
};

/**
 * Calculate the relative position of the mouse in the canvas
 * @param {object} event 
 * @returns object storing the x and y values of the mouse, relative to the canvas
 */
const getCanvasPosition = event => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    return { x, y };
};

/**
 * mousemove handler for the canvas element
 * @param {object} event 
 */
const onCanvasMouseMove = event => {
    const { x, y } = getCanvasPosition(event);

    context.beginPath();
    context.moveTo(mouse.x, mouse.y);
    context.lineTo(x, y);
    context.stroke();

    setMousePos(event);
};

/**
 * mousedown handler for the canvas element
 * @param {object} event 
 */
const onCanvasMouseDown = event => {
    setMousePos(event);

    onCanvasMouseMove(event);
    canvas.addEventListener('mousemove', onCanvasMouseMove, false);
};

/**
 * mouseup handler for the canvas element
 */
const onCanvasMouseUp = () => {
    canvas.removeEventListener('mousemove', onCanvasMouseMove, false);
};

/**
 * resize handler for the browser window
 */
const setCanvasContextState = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    context.lineWidth = document.querySelector('.stroke-width').value;
    context.strokeStyle = document.querySelector('.stroke-style').value;
};

/**
 * Initialize our canvas and context values, do some configuration
 */
const init = () => {
    const strokeWidthInput = document.querySelector('.stroke-width');
    const strokeStyleInput = document.querySelector('.stroke-style');
    strokeWidthInput.addEventListener('change', setStrokeWidth, false);
    strokeStyleInput.addEventListener('change', setStrokeStyle, false);
    
    const radios = document.querySelectorAll('input[type="radio"][name="lineCap"]');
    radios.forEach(radio => radio.addEventListener('change', setLineCapStyle, false));

    canvas = document.querySelector('#drawing-canvas');
    context = canvas.getContext('2d');

    canvas.addEventListener('mousedown', onCanvasMouseDown, false);
    canvas.addEventListener('mouseup', onCanvasMouseUp, false);
    canvas.addEventListener('mouseleave', onCanvasMouseUp, false);
    
    setCanvasContextState();
    window.addEventListener('resize', setCanvasContextState, false);
};

/**
 * As the function header describes...
 */
const clearCanvasImage = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Create a temporary <a> tag and initialize a download request for the canvas data
 */
const downloadCanvasImage = () => {
    const image = canvas.toDataURL();

    const link = document.createElement('a');
    link.download = 'image.png';
    link.href = image;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Window load handler
 */
window.addEventListener('load', init);