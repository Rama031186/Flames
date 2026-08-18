"use strict";

/*
    ==========================================
    FLAMES GAME
    ==========================================

    FLAMES:
    F = Friends
    L = Lovers
    A = Affection
    M = Marriage
    E = Enemies
    S = Siblings

    Algorithm:

    1. Normalize both names.
    2. Cancel matching letters one occurrence at a time.
    3. Count all uncancelled letters.
    4. Use that count to eliminate letters from FLAMES.
    5. Continue until one letter remains.
*/


/* ------------------------------------------
   DOM Elements
------------------------------------------ */

const name1Input = document.getElementById("name1");
const name2Input = document.getElementById("name2");

const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");

const errorMessage = document.getElementById("errorMessage");

const resultSection = document.getElementById("resultSection");

const remainingDisplay =
    document.getElementById("remainingDisplay");

const remainingCount =
    document.getElementById("remainingCount");

const eliminationSteps =
    document.getElementById("eliminationSteps");

const finalLetter =
    document.getElementById("finalLetter");

const finalRelationship =
    document.getElementById("finalRelationship");

const finalDescription =
    document.getElementById("finalDescription");


/* ------------------------------------------
   FLAMES Data
------------------------------------------ */

const FLAMES = [
    {
        letter: "F",
        name: "Friends",
        description:
            "The classic result suggests a friendly connection."
    },
    {
        letter: "L",
        name: "Lovers",
        description:
            "The classic result suggests a romantic connection."
    },
    {
        letter: "A",
        name: "Affection",
        description:
            "The classic result suggests affection and fondness."
    },
    {
        letter: "M",
        name: "Marriage",
        description:
            "The classic result suggests marriage."
    },
    {
        letter: "E",
        name: "Enemies",
        description:
            "The classic result suggests rivalry or conflict."
    },
    {
        letter: "S",
        name: "Siblings",
        description:
            "The classic result suggests a sibling-like relationship."
    }
];


/* ------------------------------------------
   Normalize Name
------------------------------------------ */

function normalizeName(name) {

    return name
        .toUpperCase()
        .replace(/[^A-Z]/g, "");

}


/* ------------------------------------------
   Cancel Matching Letters
------------------------------------------

   Example:

   TARUN
   TARA

   T appears in both -> cancel
   A appears in both -> cancel
   R appears in both -> cancel

   The algorithm handles duplicate letters
   individually rather than using Set().
*/

function getRemainingLetters(name1, name2) {

    const first = normalizeName(name1);
    const second = normalizeName(name2);

    const firstChars = first.split("");
    const secondChars = second.split("");

    const usedSecond = new Array(secondChars.length)
        .fill(false);

    const remainingFirst = [];
    const remainingSecond = [];


    /*
        Match every character in the first name
        with exactly one unused character in
        the second name.
    */

    for (let i = 0; i < firstChars.length; i++) {

        const char = firstChars[i];

        let matchIndex = -1;

        for (let j = 0; j < secondChars.length; j++) {

            if (
                !usedSecond[j] &&
                secondChars[j] === char
            ) {
                matchIndex = j;
                break;
            }

        }


        if (matchIndex !== -1) {

            /*
                Matching pair found.

                Mark the second occurrence as used.
                The first occurrence is also removed
                by NOT adding it to remainingFirst.
            */

            usedSecond[matchIndex] = true;

        } else {

            /*
                No matching letter exists in
                the other name.
            */

            remainingFirst.push(char);

        }

    }


    /*
        Any second-name letters that were not used
        in a match remain.
    */

    for (let i = 0; i < secondChars.length; i++) {

        if (!usedSecond[i]) {

            remainingSecond.push(secondChars[i]);

        }

    }


    return [
        ...remainingFirst,
        ...remainingSecond
    ];

}


/* ------------------------------------------
   FLAMES Calculation
------------------------------------------

   This follows the circular elimination method.

   Important detail:

   Suppose the current list is:

       F L A M E S

   and count = 7.

   Start at index 0.

   (0 + 7 - 1) % 6
   = 0

   Therefore F is removed.

   Counting continues from the item immediately
   after the removed item.

   This is the standard Josephus-style
   interpretation of the FLAMES elimination.
*/

function calculateFlames(count) {

    let remaining = FLAMES.map(item => ({
        ...item
    }));

    let currentIndex = 0;

    const steps = [];


    /*
        If both names cancel completely, count = 0.

        There is no universal historical FLAMES
        standard for this edge case.

        We use 1 as the circular count so that
        the game still produces a deterministic
        result instead of becoming undefined.
    */

    const effectiveCount = count === 0 ? 1 : count;


    while (remaining.length > 1) {

        /*
            Calculate the index of the item to remove.

            -1 is required because the current
            position counts as 1.
        */

        const removeIndex =
            (currentIndex + effectiveCount - 1)
            % remaining.length;


        const removed = remaining[removeIndex];


        steps.push({
            count: effectiveCount,
            removed: removed.letter,
            removedName: removed.name,
            remaining: remaining
                .filter((_, index) => index !== removeIndex)
                .map(item => item.letter)
                .join(" ")
        });


        /*
            Remove the selected letter.
        */

        remaining.splice(removeIndex, 1);


        /*
            Continue from the position immediately
            after the removed item.

            If the removed item was the last item
            in the array, modulo brings us back
            to index 0.
        */

        currentIndex =
            removeIndex % remaining.length;

    }


    return {
        winner: remaining[0],
        steps
    };

}


/* ------------------------------------------
   Display Remaining Letters
------------------------------------------ */

function displayRemainingLetters(letters) {

    remainingDisplay.innerHTML = "";


    if (letters.length === 0) {

        const empty = document.createElement("span");

        empty.className = "empty-remaining";

        empty.textContent =
            "All letters cancelled";

        remainingDisplay.appendChild(empty);

        return;

    }


    letters.forEach(letter => {

        const element =
            document.createElement("span");

        element.className =
            "remaining-letter";

        element.textContent = letter;

        remainingDisplay.appendChild(element);

    });

}


/* ------------------------------------------
   Reset FLAMES Board
------------------------------------------ */

function resetFlamesBoard() {

    const items =
        document.querySelectorAll(".flame-item");


    items.forEach(item => {

        item.classList.remove(
            "eliminated",
            "active"
        );

    });

}


/* ------------------------------------------
   Display Elimination Steps
------------------------------------------ */

function displayEliminationSteps(steps) {

    eliminationSteps.innerHTML = "";


    steps.forEach((step, index) => {

        const row =
            document.createElement("div");

        row.className = "step";


        const number =
            document.createElement("span");

        number.className = "step-number";

        number.textContent = index + 1;


        const text =
            document.createElement("span");

        text.innerHTML =
            `Count ${step.count} → `
            + `<strong>${step.removed}</strong> `
            + `(${step.removedName}) eliminated`;


        row.appendChild(number);

        row.appendChild(text);

        eliminationSteps.appendChild(row);

    });

}


/* ------------------------------------------
   Animate Elimination
------------------------------------------ */

async function animateElimination(steps) {

    resetFlamesBoard();


    const items =
        document.querySelectorAll(".flame-item");


    /*
        Animation is purely visual.

        The actual result was already calculated
        using calculateFlames().
    */

    for (const step of steps) {

        const item =
            [...items].find(
                element =>
                    element.dataset.letter === step.removed
            );


        if (!item) {
            continue;
        }


        item.classList.add("active");


        await delay(450);


        item.classList.remove("active");

        item.classList.add("eliminated");


        await delay(250);

    }

}


/* ------------------------------------------
   Utility Delay
------------------------------------------ */

function delay(milliseconds) {

    return new Promise(resolve =>
        setTimeout(resolve, milliseconds)
    );

}


/* ------------------------------------------
   Show Final Result
------------------------------------------ */

function displayFinalResult(result) {

    finalLetter.textContent =
        result.winner.letter;

    finalRelationship.textContent =
        result.winner.name;

    finalDescription.textContent =
        result.winner.description;

}


/* ------------------------------------------
   Main Game Function
------------------------------------------ */

async function playGame() {

    const name1 = name1Input.value.trim();
    const name2 = name2Input.value.trim();


    /* Validation */

    if (!name1 || !name2) {

        errorMessage.textContent =
            "Please enter both names.";

        return;

    }


    const normalized1 =
        normalizeName(name1);

    const normalized2 =
        normalizeName(name2);


    if (!normalized1 || !normalized2) {

        errorMessage.textContent =
            "Please enter names containing letters.";

        return;

    }


    if (normalized1 === normalized2) {

        errorMessage.textContent =
            "Please enter two different names.";

        return;

    }


    errorMessage.textContent = "";


    /*
        Calculate remaining letters.
    */

    const remainingLetters =
        getRemainingLetters(
            name1,
            name2
        );


    const count =
        remainingLetters.length;


    /*
        Calculate FLAMES.
    */

    const result =
        calculateFlames(count);


    /*
        Display result section.
    */

    resultSection.classList.remove("hidden");


    displayRemainingLetters(
        remainingLetters
    );


    remainingCount.textContent =
        count;


    displayEliminationSteps(
        result.steps
    );


    displayFinalResult(
        result
    );


    /*
        Scroll smoothly to the result.
    */

    setTimeout(() => {

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);


    /*
        Play elimination animation.
    */

    await animateElimination(
        result.steps
    );

}


/* ------------------------------------------
   Reset Game
------------------------------------------ */

function resetGame() {

    name1Input.value = "";
    name2Input.value = "";

    errorMessage.textContent = "";

    resultSection.classList.add("hidden");

    resetFlamesBoard();

    remainingDisplay.innerHTML = "";

    remainingCount.textContent = "0";

    eliminationSteps.innerHTML = "";

    finalLetter.textContent = "?";

    finalRelationship.textContent = "-";

    finalDescription.textContent = "";

    name1Input.focus();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ------------------------------------------
   Event Listeners
------------------------------------------ */

calculateBtn.addEventListener(
    "click",
    playGame
);


resetBtn.addEventListener(
    "click",
    resetGame
);


/*
    Allow Enter key to calculate.
*/

[name1Input, name2Input].forEach(input => {

    input.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                playGame();

            }

        }
    );

});