/*http://bililite.com/blog/2012/08/05/line-numbering-in-pre-elements/*/
function wrapLines (el){
	var text = el.textContent.split('\n');
	var range = document.createRange();
	var pointer = 0; // start of text
	el.textContent.split('\n').forEach(function(line, i){
		var len = line.length;
		setBounds (pointer, pointer+len); // sets range to the characters of the line
		var wrapper = document.createElement('span');
		wrapper.setAttribute('class', 'line');
		wrapper.appendChild(range.extractContents()); // pulls the contents of the range out of the document and into wrapper
		range.insertNode(wrapper); // and put back the wrapped line
		pointer += len+1; // skip the newline
	});
	// now, we're left with a bunch of empty spans/other elements that were split across lines and the browser divided them into three parts (first line, newline character, second line)
	// those mess up the odd/even calculations. Replace them with plain text.
	for (var node = el.firstChild; node; node = node.nextSibling){
		if (node.nodeType != 3 && node.getAttribute('class') != 'line'){
			var replacement = document.createTextNode(node.textContent);
			el.replaceChild(replacement, node);
			node = replacement;
		}
	}
	
	function setBounds (start, end){
		// since the browser throws an error if we try to move the beginning past the end (unlike IE, which just adusts the end)
		// we have to reset the range to cover the entire element, then move the start, then move the end to the start, then move the end
		range.selectNodeContents(el);
		moveBoundary (start, 'start');
		range.collapse (true);
		moveBoundary (end-start, 'end');
	}
	function moveBoundary (n, start){
		// move the boundary n characters forward, up to the end of the element. Forward only!
		//  start is 'start' or 'end', and is used to create the appropriate method names ('startContainer' or 'endContainer' etc.)
		// if the start is moved after the end, then an exception is raised
		if (n <= 0) return;
		var startNode = range[start+'Container'];
		// we may be starting somewhere into the text
		if (startNode.nodeType == 3) n += range[start+'Offset'];
		// nodeIterators from http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html
		var iter = document.createNodeIterator(el, 4 /* SHOW_TEXT */), node;
		while (node = iter.nextNode()){
			if (startNode.compareDocumentPosition(node) & 2 /* DOCUMENT_POSITION_PRECEDING */ ) continue;
			if (n <= node.nodeValue.length){
				// we found the last character!
				range[start == 'start' ? 'setStart' :'setEnd'](node, n);
				return;
			}else{
				n -= node.nodeValue.length; // eat these characters
			}
		}
	}
}