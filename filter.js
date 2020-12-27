window.onload = () => {

    //totop
    //descriptions
    let colorModeCheckbox = document.querySelector("#color-mode-checkbox")

    // Set default theme according to user's preference from local storage or at OS level
    if (localStorage.getItem("color-mode") == "dark"
        || window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.setAttribute("color-mode", "dark")
        colorModeCheckbox.checked = true
    }

    // toggle color mode
    colorModeCheckbox.addEventListener("change", event => {
        let toMode = event.target.checked ? "dark" : "light"
        document.documentElement.setAttribute("color-mode", toMode)
        localStorage.setItem("color-mode", toMode)
    })

    //populate tags into drop lists
    let tagList = document.querySelector("#tag-list")
    fetch('./tags.json')
    .then(response => response.json())
    .then(tags => {
        for (const attr of tags) {
            attr.tags.forEach(tag => {
                let option = document.createElement("option")
                option.setAttribute("value", tag)
                option.textContent = tag
                tagList.appendChild(option)
            });
        }
    });

    document.querySelector("#filterBtn").addEventListener("click", () => filter())

    document.querySelectorAll("svg").forEach(icon => icon.addEventListener("click", event => {
        event.target.closest("div").children[0].value = ""
    }))

    const getCellValue = (tr, idx) => tr.children[idx].innerHTML

    const comparator = (idx, asc) => (a, b) => getCellValue(asc ? a : b, idx).localeCompare(getCellValue(asc ? b : a, idx))

    document.querySelectorAll("th").forEach((th, _, ths) => th.addEventListener("click", () => {
        // sort table
        const table = document.querySelector("#result")
        let flag = true;
        ths.forEach(thead => {
            if (thead.classList.contains("asc")) {
                thead.classList.remove("asc")
                if (thead == th)
                    flag = false
            }
            if (thead.classList.contains("desc"))
                thead.classList.remove("desc")
        })
        th.classList.add(flag ? "asc" : "desc")
        Array.from(table.querySelectorAll("tr"))
        .sort(comparator(Array.from(ths).indexOf(th), flag))
        .forEach(tr => table.appendChild(tr))
    }));
}

function filter() {
    //read tags
    const tagNum = document.querySelector("#applied-tag-num").value
    let validTags = []
    Array.from(document.querySelectorAll(".tag")).forEach(element => addTag(validTags, element.children[0].value))
    if (validTags.length < tagNum) {
        alert("有效標籤數量過少")
        return;
    }

    const recruitHour = document.querySelector("#recruit-hour").value

    fetch('./tags.json')
    .then(response => response.json())
    .then(tags => {
        charAttributes = tags
        return fetch('./characters.json')
    })
    .then(response => response.json())
    .then(chars => {
        // retrieve attributes and tags organized by attributes
        charAttrs = []
        for (const attr of charAttributes)
            charAttrs.push([attr.attribute, attr.tags])

        let survivorSet = [[[]]]
        for (let k = 5; k >= tagNum; k--) {
            // generate combinations
            const tagComb = Array.from(combinations(validTags, k))

            // screen out ineligible characters
            tagComb.forEach(tags => {
                let appliedTags = []
                // filter by rank and time
                var fChars
                if (tags.includes("領袖"))
                    fChars = recruitHour < 9 ? chars : chars.filter(char => char.grade == 3)
                else if (tags.includes("菁英"))
                    fChars = recruitHour < 9 ? chars.filter(char => char.grade < 3) : chars.filter(char => char.grade == 2)
                else
                    fChars = recruitHour < 4 ? chars.filter(char => char.grade < 2) : chars.filter(char => char.grade < 3)
                
                // filter by type, category, race, body and oppai
                for (let i = 0; i < 5; i++) {
                    if (tags.length == 0 || fChars.length == 0)
                        break
                    charAttrs[i][1].forEach(attrTag => {
                        if (tags.includes(attrTag)) {
                            fChars = fChars.filter(t => t[charAttrs[i][0]] == attrTag)
                            appliedTags.push(attrTag)
                            tags.splice(tags.indexOf(attrTag), 1)
                        }
                    })
                }
                
                // filter by the rest tags
                const survivors = fChars.filter(char => tags.every(t => char.tags.includes(t)))
                if (survivors.length > 0)
                    survivorSet = survivorSet.concat([[survivors, tags.concat(appliedTags)]])
            })
            chars = chars.filter(char => !survivorSet.some(s => s[0].includes(char)))
        }

        survivorSet = survivorSet.slice(1, survivorSet.length)

        if (survivorSet.length == 0) {
            alert("無符合結果")
            return;
        }

        // update result
        let result = document.querySelector("#result")
        result.innerHTML = ""
        survivorSet.forEach(pair => {
            let chars = pair[0]
            let tags = pair[1]
            chars.forEach(char => {
                let row = result.insertRow()
                let name = row.insertCell()
                let grade = row.insertCell()
                let type = row.insertCell()
                let category = row.insertCell()
                let appliedTags = row.insertCell()
    
                row.setAttribute("class", char.type)
                name.innerHTML = char.name
                grade.innerHTML = char.grade
                type.innerHTML = char.type
                category.innerHTML = char.category
                appliedTags.innerHTML = tags.join(", ")
                appliedTags.style.cursor = "pointer"

                appliedTags.addEventListener("click", () => {
                    if (!confirm("確定要套用該角色標籤?"))
                        return;
                    
                    //update table
                    let trs = document.querySelectorAll("tr")
                    for (let i = trs.length - 1; i >0; i--) {
                        const thatTags = trs[i].lastChild.innerHTML.split(", ")
                        if (!tags.every(t => thatTags.includes(t)))
                            document.querySelector("#result").deleteRow(i - 1)
                    }
                })
            })
        })
    });
}

function addTag(arr, input) {
    let option = document.querySelector("#tag-list option[value='" + input + "']")
    if (option != null && option.value.length > 0 && !arr.includes(input))
        arr.push(input)
}

function* combinations(elements, num) {
    for (let i = 0; i < elements.length; i++) {
        if (num == 1)
            yield [elements[i]]
        else {
            let remaining = combinations(elements.slice(i + 1, elements.length), num - 1)
            for (let next of remaining)
                yield [elements[i], ...next]
        }
    }
}
