document.addEventListener("DOMContentLoaded", function(){
    // Set theme when DOM is ready
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
  });

window.onload = () => {

    // help info button
    let helpModal = document.querySelector("#help-modal")
    document.querySelector("#help-icon").addEventListener("click", () => {
        helpModal.style.display = "block"
    })

    // close help modal button
    document.querySelector("#close-help-modal").addEventListener("click", () => {
        helpModal.style.display = "none"
    })

    // back to top button
    document.querySelector("#to-top-icon").addEventListener("click", () => {
        document.body.scrollTop = 0 // For Safari
        document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera
    })

    // add select tag buttons
    Array.from(document.querySelectorAll(".tag-container"))
    .forEach(slot => clearTag(slot))

    // select tag
    let tagModal = document.querySelector("#tag-select-modal")
    document.querySelectorAll(".tag-container").forEach(tagBtn => {
        tagBtn.addEventListener("click", (event) => {
            tagModal.style.display = "block"
            prepareModal(event.target.closest("li").children[0])
        })
    })

    let tagSearchElement = document.querySelector("#tag-search-input")
    // close modal when user clicks outside of the modal
    window.onclick = (event) => {
        if (event.target == helpModal)
            helpModal.style.display = "none"
        else if (event.target == tagModal) {
            tagModal.style.display = "none"
            // clear user's seach
            tagSearchElement.value = ""
        }
    }

    // close tag select modal button
    document.querySelector("#close-tag-modal").addEventListener("click", () => {
        tagModal.style.display = "none"
        tagSearchElement.value = ""
    })

    // filter button
    document.querySelector("#filterBtn").addEventListener("click", () => filter())

    // delete all tags
    document.querySelector("#delete-icon").addEventListener("click", event => {
        Array.from(document.querySelectorAll(".tag-container"))
        .forEach(slot => clearTag(slot))
    })

    const getCellValue = (tr, idx) => tr.children[idx].innerHTML

    const comparator = (idx, asc) => (a, b) => getCellValue(asc ? a : b, idx).localeCompare(getCellValue(asc ? b : a, idx))

    document.querySelectorAll("th").forEach((th, _, ths) => th.addEventListener("click", () => {
        // sort table
        const table = document.querySelector("#result")
        let isDesc = true;
        ths.forEach(thead => {
            if (thead.classList.contains("asc")) {
                thead.classList.remove("asc")
                if (thead == th)
                    isDesc = false
            }
            if (thead.classList.contains("desc"))
                thead.classList.remove("desc")
        })
        th.classList.add(isDesc ? "asc" : "desc")
        Array.from(table.querySelectorAll("tr"))
        .sort(comparator(Array.from(ths).indexOf(th), isDesc))
        .forEach(tr => table.appendChild(tr))
    }));
}

function prepareModal(tagSlot) {
    //populate tags into tag select modal
    let tagList = document.querySelector("#tag-list")
    tagList.innerHTML = ""
    fetch('./tags.json')
    .then(response => response.json())
    .then(tags => {
        for (const attr of tags)
            attr.tags.forEach(tag => addTag(tagSlot, tagList, attr.attribute, tag))

        // search tags
        document.querySelector("#tag-search-input")
        .addEventListener("input", (event) => {
            let query = event.target.value
            tagList.innerHTML = ""
            for (const attr of tags) {
                attr.tags.forEach(tag => {
                    if (tag.includes(query))
                        addTag(tagSlot, tagList, attr.attribute, tag)
                })
            }
        })

        // select tab
        Array.from(document.querySelectorAll(".tag-tab")).forEach(tab => {
            tab.addEventListener("click", (event) => {
                Array.from(document.querySelectorAll(".tag-tab"))
                .forEach(t => t.classList.remove("tab-active"))
                let tabElement = event.target.closest("li")
                tabElement.classList.add("tab-active")
                let tabStr = tabElement.children[0].getAttribute("id")
                Array.from(tagList.children).forEach(tag => {
                    if (tag.classList.contains(tabStr)) {
                        if (tag.classList.contains("tag-hidden"))
                            tag.classList.remove("tag-hidden")
                    } else {
                        if (!tag.classList.contains("tag-hidden"))
                            tag.classList.add("tag-hidden")
                    }
                })
            })
        })
    })
}

function addTag(slot, target, attribute, tagStr) {
    let tag = createTagElemet(attribute, tagStr)
    // add tag event
    tag.addEventListener("click", () => {
        tag.classList.add("tag")
        slot.innerHTML = ""
        slot.classList.remove("tag-type-container")
        slot.classList.remove("tag-category-container")
        slot.classList.remove("tag-race-container")
        slot.classList.remove("tag-body-container")
        slot.classList.remove("tag-oppai-container")
        slot.classList.remove("tag-rank-container")
        slot.classList.remove("tag-else-container")
        slot.classList.add("tag-" + attribute + "-container")
        slot.appendChild(tag)
        let removeIcon = document.createElement("span")
        removeIcon.innerHTML = "&times;"
        removeIcon.setAttribute("style", "margin-right: 12px")
        removeIcon.addEventListener("click", (event) => {
            event.stopImmediatePropagation();
            clearTag(slot)
        })
        slot.appendChild(removeIcon)
        // close modal
        document.querySelector("#tag-select-modal").style.display = "none"
        document.querySelector("#tag-search-input").value = ""
    })
    tag.classList.add("tag-all")
    tag.classList.add("tag-" + attribute)
    target.appendChild(tag)
}

function createTagElemet(attribute, tagStr) {
    // create tag icon
    let useIcon = document.createElementNS("http://www.w3.org/2000/svg", "use")
    useIcon.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href",
        "#" + attribute + "-icon"
    )
    let icon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    icon.classList.add("filter-icon")
    icon.classList.add("tag-icon")
    icon.appendChild(useIcon)
    // add tag text
    let tag = document.createElement("div")
    let tagText =document.createElement("span")
    tagText.innerHTML = tagStr
    tag.appendChild(icon)
    tag.appendChild(tagText)
    return tag
}

function clearTag(slot) {
    slot.innerHTML = ""
    slot.classList.remove("tag-type-container")
    slot.classList.remove("tag-category-container")
    slot.classList.remove("tag-race-container")
    slot.classList.remove("tag-body-container")
    slot.classList.remove("tag-oppai-container")
    slot.classList.remove("tag-rank-container")
    slot.classList.remove("tag-else-container")
    let plainTag = createTagElemet("tag", "選擇標籤")
    plainTag.classList.add("tag")
    slot.appendChild(plainTag)
}

function filter() {
    // read tags
    const tagNum = document.querySelector("#applied-tag-num").value
    let validTags = readTag()
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

function readTag() {
    let tags = []
    Array.from(document.querySelectorAll(".tag")).forEach(tag => {
        tagStr = tag.children[1].innerHTML
        if (tagStr != null && tagStr.length > 0
            && tagStr != "選擇標籤" && !tags.includes(tagStr))
            tags.push(tagStr)
    })
    return tags
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
