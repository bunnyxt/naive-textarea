/* by bunnyxt 2019.9.25 */

var naive_textarea = new Vue({
    el: "#naive_textarea",
    data: function () {
        return {
            message: "",
            username_list: [],
            username_list_filtered: [],
            pos: -1,
            inat: false,
            atstr: "",
            justfinish: false,
            paneltotop: 0,
            paneltoleft: 0
        }
    },
    computed: {
        panelStyle: function () {
            return {
                position: "absolute",
                top: this.paneltotop + 'px',
                left: this.paneltoleft + 'px',
                display: this.inat ? "block" : "none"
            }
        }
    },
    watch: {
        message: function (after, before) {

            if (this.justfinish) {
                this.justfinish = false;
                this.inat = false;
                this.atstr = '';
                return;
            }

            // 01 find input chat pos
            let pos = -1;
            if (after.length < before.length) {
                // del char
                for (let i = 0; i < after.length; i++) {
                    if (after[i] !== before[i]) {
                        pos = i - 1;
                        break;
                    }
                }
                if (pos === -1) {
                    pos = after.length - 1;
                }
            } else {
                // add char
                for (let i = 0; i < before.length; i++) {
                    if (after[i] !== before[i]) {
                        pos = i + (after.length - before.length) - 1;
                        break;
                    }
                }
                if (pos === -1) {
                    pos = after.length - 1;
                }
            }
            this.pos = pos;

            // 02 check status and get at str
            let inat = false;
            let atstr = "";
            for (let i = 0; i <= pos; i++) {
                let ch = after.charAt(i);
                if (inat) {
                    if (ch === ' ' || ch === '\n') {
                        inat = false;
                    } else if (ch === '@') {
                        atstr = ""
                    } else {
                        atstr += ch;
                    }
                } else {
                    if (ch === '@') {
                        inat = true;
                        atstr = ""
                    }
                }
            }
            this.inat = inat;
            this.atstr = atstr;

            // 03 filter username
            if (!inat) {
                this.username_list_filtered = []
            } else {
                let filtered_list = [];
                this.username_list.forEach(function (value) {
                    if (value.startsWith(atstr)) {
                        filtered_list.push(value);
                    }
                });
                let limit = 10; // to avoid panel too long
                this.username_list_filtered = filtered_list.slice(0, limit);
            }

            // 04 change position
            let textarea = document.getElementById("nt_textarea");
            let textareaToTop = this.getElementTop(textarea);
            let textareaToLeft = this.getElementLeft(textarea);
            let paddingTop = 6 + 12;
            let paddingLeft = 0;
            let caret = getCaretCoordinates(textarea, textarea.selectionEnd);  // defined in textarea-caret-position.js
            this.paneltotop = textareaToTop + paddingTop + caret.top;
            this.paneltoleft = textareaToLeft + paddingLeft + caret.left;
        }
    },
    methods: {
        itemClickHandler: function (event) {
            let content = event.target.textContent;
            let mid = '';
            let instr = false;
            for (let i = 0; i < content.length; i++) {
                if (!instr) {
                    if (content.charAt(i) === ' ' || content.charAt(i) === '\n') {
                        continue;
                    } else {
                        instr = true;
                        mid += content.charAt(i);
                    }
                } else {
                    if (content.charAt(i) === ' ' || content.charAt(i) === '\n') {
                        break;
                    } else {
                        mid += content.charAt(i);
                    }
                }
            }

            let atpos = this.pos;
            while (atpos > 0) {
                if (this.message.charAt(atpos) === '@') {
                    break;
                }
                atpos--;
            }

            this.justfinish = true;

            let left = this.message.substring(0, atpos + 1);
            let right = this.message.substring(atpos + 1 + this.atstr.length);
            this.message = left + mid + " " + right;

            // set focus back to textarea
            let textarea = document.getElementById("nt_textarea");
            textarea.focus();

            // set index after space
            let len = textarea.value.length;
            let index = atpos + 1 + mid.length + 1;
            if (len < index) {
                return
            }
            setTimeout(function () {
                if (textarea.setSelectionRange) { // other browser
                    textarea.setSelectionRange(index, index);
                } else { // IE9--
                    let range = textarea.createTextRange();
                    range.moveStart("character", -len);
                    range.moveEnd("character", -len);
                    range.moveStart("character", index);
                    range.moveEnd("character", 0);
                    range.select();
                }
            }, 10)
        },
        getElementLeft: function (element) {
            let actualLeft = element.offsetLeft;
            let current = element.offsetParent;
            while (current !== null) {
                actualLeft += current.offsetLeft;
                current = current.offsetParent;
            }
            return actualLeft;
        },
        getElementTop: function (element) {
            let actualTop = element.offsetTop;
            let current = element.offsetParent;
            while (current !== null) {
                actualTop += current.offsetTop;
                current = current.offsetParent;
            }
            return actualTop;
        }
    },
    created: function () {
        // api get username_list
        // fetch("http://your.api.url")
        //   .then(response => response.json())
        //   .then(json => this.username_list = json)
        // username_list for test
        this.username_list = [
            "洛天依",
            "洛天依世界第一可爱",
            "洛水天依",
            "乐正绫",
            "乐正龙牙"
        ];
    }
});