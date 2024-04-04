import React from "react";

function Icon(koef = 1) {
    let w = 40 * koef;
    let h = 30 * koef;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={w}
            height={h}
            viewBox="0, 0, 400,303.3333333333333"
        >
            <g>
                </path>
            </g>
        </svg>
    );
}

export default Icon;