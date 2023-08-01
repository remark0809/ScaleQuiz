const VF = Vex.Flow;
const svgId = 'vf';
const svgElemId = 'path';
const wrongClass = 'wrong';
const scaleDivId = "current-scale";
const buttonsId = "buttons";

const scales = {
    'C Major': ['c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5'],
    'D Major': ['d/3', 'e/3', 'f#/3', 'g/3', 'a/3', 'b/3', 'c#/4', 'd/4', 'e/4', 'f#/4', 'g/4', 'a/4', 'b/4', 'c#/5', 'd/5'],
    'A Major': ['a/2', 'b/2', 'c#/3', 'd/3', 'e/3', 'f#/3', 'g#/3', 'a/3', 'b/3', 'c#/4', 'd/4', 'e/4', 'f#/4', 'g#/4', 'a/4'],
    'G Major': ['g/3', 'a/3', 'b/3', 'c/4', 'd/4', 'e/4', 'f#/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f#/5', 'g/5'],
    'F Major': ['f/3', 'g/3', 'a/3', 'bb/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'bb/4', 'c/5', 'd/5', 'e/5', 'f/5'],
    'Bb Major': ['bb/2', 'c/3', 'd/3', 'eb/3', 'f/3', 'g/3', 'a/3', 'bb/3', 'c/4', 'd/4', 'eb/4', 'f/4', 'g/4', 'a/4', 'bb/4'],
    'Eb Major': ['eb/3', 'f/3', 'g/3', 'ab/3', 'bb/3', 'c/4', 'd/4', 'eb/4', 'f/4', 'g/4', 'ab/4', 'bb/4', 'c/5', 'd/5', 'eb/5']
    // Add more scales as needed
};

let scaleKeys = Object.keys(scales);
let currentScale = '';
let currentDegree = '';

// Create an SVG renderer and attach it to the DIV element named "vf".
const div = document.getElementById(svgId);
const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

// Configure the rendering context.
renderer.resize(500, 300);
const context = renderer.getContext();
context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

// Create a stave
let trebleStave = new VF.Stave(10, 0, 400);
let bassStave = new VF.Stave(10, 100, 400);

// Add a clef and time signature.
trebleStave.addClef("treble");
bassStave.addClef("bass");

// Connect it to the rendering context and draw!
trebleStave.setContext(context).draw();
bassStave.setContext(context).draw();

// Connect staves
let connector = new VF.StaveConnector(trebleStave, bassStave);
connector.setType(VF.StaveConnector.type.BRACE);
connector.setContext(context).draw();

function newNote() {
    // Clear the old stave
    context.clear();
    trebleStave.setContext(context).draw();
    bassStave.setContext(context).draw();
    connector.setContext(context).draw();

    // Create a new random note
    let scaleIndex = Math.floor(Math.random() * scaleKeys.length);
    currentScale = scaleKeys[scaleIndex];
    let degreeIndex = Math.floor(Math.random() * scales[currentScale].length);
    // Because degrees are 1-indexed, also convert to string for comparison
    currentDegree = ((degreeIndex % 7) + 1).toString();
    let clef = degreeIndex < scales[currentScale].length / 2 ? "bass" : "treble"; // Decides clef based on note range
    let note = new VF.StaveNote({clef: clef, keys: [scales[currentScale][degreeIndex]], duration: "w" });

    // Draw the note
    let voice = new VF.Voice({num_beats: 4, beat_value: 4});
    voice.addTickables([note]);
    let formatter = new VF.Formatter().joinVoices([voice]).format([voice], 400);
    voice.draw(context, clef === "bass" ? bassStave : trebleStave);

    // Update the current scale display
    document.getElementById("current-scale").innerText = "Current scale: " + currentScale;
}



function flashWrongNote() {
    let svgElem = document.querySelector('svg g path');
    svgElem.classList.add('wrong');
    setTimeout(() => {
        svgElem.classList.remove('wrong');
    }, 500);
}

function checkInput(input) {
    const romanToArabic = {
        'I': 1,
        'II': 2,
        'III': 3,
        'IV': 4,
        'V': 5,
        'VI': 6,
        'VII': 7
    };
    // Ensure both values are strings for comparison
    if (romanToArabic[input].toString() === currentDegree) {
        newNote();
    } else {
        flashWrongNote();
    }
}

window.addEventListener('keydown', function(event) {
    const arabicToRoman = {
        '1': 'I',
        '2': 'II',
        '3': 'III',
        '4': 'IV',
        '5': 'V',
        '6': 'VI',
        '7': 'VII'
    };

    // If the key is a Roman numeral or a number from 1 to 7
    let validKeys = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', '1', '2', '3', '4', '5', '6', '7'];
    if (!validKeys.includes(event.key.toLowerCase())) {
        return;
    }

    let inputKey = event.key.toUpperCase();
    if (Object.keys(arabicToRoman).includes(inputKey)) {
        // If the input is a number, convert it to a Roman numeral
        inputKey = arabicToRoman[inputKey];
    }

    checkInput(inputKey);
});

let buttons = document.getElementById("buttons").getElementsByTagName("button");
for(let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function() {
        checkInput(this.innerText);
    });
}

newNote();



