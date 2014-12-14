"use strict";
/*
 * Filename: numberlines.js
 * Synopsis: Numbers lines in <pre> blocks automatically
 * Dependency: requires numberlines.css
 * Developer: David J. Birnbaum, djbpitt@gmail.com, http://www.obdurodon.org
 * License: Creative Commons Attribution 4.0 International License (http://creativecommons.org/licenses/by/4.0/)
 *
 * 2014-11-16 Initial version
 * 2014-11-18 Change from load event to DOMContentLoaded to reduce FOUT
 * 2014-12-10 Retrieves color from parent span if there is one
 *   Use @class instead of @id to attach and reset numbering in CSS (to support multiple <pre> elements)
 *   Fixes (well, fakes) height of container <pre> vertical spacing
 *   Combined function to return start and end positions in a single call
 *   CSS white-space: pre-wrap to handle long lines
 * 2014-12-14
 *   Get all wrappers and properties all the way up
 * To do:
 *   Use private namespace or anonymous functions
 *   Add display widgets from https://wordpress.org/plugins/crayon-syntax-highlighter/
 *
 * Based on http://bililite.com/blog/2012/08/05/line-numbering-in-pre-elements/
 * Additional information about JavaScript ranges
 *   By (whom else?!) PPK at http://www.quirksmode.org/dom/range_intro.html
 *   And at https://developer.mozilla.org/en-US/docs/Web/API/Range
 * For NodeIterator see:
 *   https://developer.mozilla.org/en-US/docs/Web/API/NodeIterator
 *   http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html
 */
function processBlocks() {
    var blocks = document.getElementsByClassName('block');
    for (var i = 0; i < blocks.length; i++) {
        numberLines(blocks[i]);
    }
}
function numberLines(block) {
    var range = document.createRange(); // hold current line
    var rebuilt = document.createDocumentFragment(); // assemble <span>-tagged replacement for original <pre> content
    var span; // create a span to wrap the line
    var fragment; // clone the range contents into here and then do span.appendChild
    var startPos = 0;
    var endPos = 0;
    var nodesAndOffsets; // get start and end nodes and offsets back as associative array
    var startNode, startOffset, endNode, endOffset;
    var startAncestor, endAncestor, startAncestors = [], endAncestors = [];
    var deepestNode;
    var hierarchy;
    var lines;
    var i, j;
    lines = block.textContent.split('\n');
    for (i = 0; i < lines.length; i++) {
        endPos = startPos + lines[i].length;
        nodesAndOffsets = getNodesAndOffsets(block,startPos,endPos);
        startNode = nodesAndOffsets['startNode'];
        startOffset = nodesAndOffsets['startOffset'];
        endNode = nodesAndOffsets['endNode'];
        endOffset = nodesAndOffsets['endOffset'];
        range.setStart(startNode,startOffset);
        range.setEnd(endNode,endOffset);
        span = document.createElement('span');
        startAncestors = [];
        startAncestor = startNode.parentNode;
        while (startAncestor.nodeName != 'pre') {
            startAncestors.push(startAncestor);
            startAncestor = startAncestor.parentElement;
        }
        endAncestors = [];
        endAncestor = endNode.parentNode;
        while (endAncestor.nodeName != 'pre') {
            endAncestors.push(endAncestor);
            endAncestor = endAncestor.parentElement;
        }
        fragment = range.cloneContents();
        // traverse startAncestors array in reverse, rebuilding hierarchy inside "span"
        // then insert "fragment" at the deepest point
        deepestNode = span;
        if (startAncestors.length > 0 && endAncestors.length > 0) {
            hierarchy = (startAncestors.length >= endAncestors.length) ? endAncestors : startAncestors;
            for (j = hierarchy.length - 1; j >= 0; j--) {
                deepestNode.appendChild(hierarchy[j].cloneNode(false));
                deepestNode = deepestNode.firstElementChild;
            }
        }
        deepestNode.appendChild(fragment);
        rebuilt.appendChild(span);
        startPos += lines[i].length + 1;
    }
    block.innerHTML = "";
    block.appendChild(rebuilt.cloneNode(true));
    block.style.height=(lines.length * 1.1) + 'em';
    block.classList.contains('numbered') ? true : block.classList.add('numbered');
}
function getNodesAndOffsets(root, startPosition, endPosition) {
    var nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT);
    var currentNode;
    var currentNodeOffset;
    var position = 0;
    var nodeLength;
    var startNode = null, startOffset, endNode, endOffset;
    while (currentNode = nodeIterator.nextNode()) {
        nodeLength = currentNode.nodeValue.length;
        if (position <= startPosition && startPosition <= (position + currentNode.nodeValue.length)) {
            currentNodeOffset = startPosition - position;
            startNode = currentNode;
            startOffset = currentNodeOffset;
        }
        if (position <= endPosition && endPosition <= (position + currentNode.nodeValue.length)) {
            currentNodeOffset = endPosition - position;
            endNode = currentNode;
            endOffset = currentNodeOffset;
            return {startNode : startNode, startOffset: startOffset, endNode : endNode, endOffset: endOffset}
        }
        position += nodeLength;
    }
}
window.addEventListener('DOMContentLoaded', processBlocks, false);