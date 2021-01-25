// A character filter for enlist in the game TenkafuMA!
// @author purindaisuki

// Set up color theme
document.addEventListener("DOMContentLoaded", () => {
    // Set theme when DOM is ready
    let colorThemeCheckbox = document.querySelector("#color-mode-checkbox")

    // Set default theme according to user's preference from local storage or at OS level
    if (localStorage.getItem("color-mode") == "dark"
        || window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.setAttribute("color-mode", "dark")
        colorThemeCheckbox.checked = true
    }

    // toggle color theme
    colorThemeCheckbox.addEventListener("change", event => {
        let toTheme = event.target.checked ? "dark" : "light"
        document.documentElement.setAttribute("color-mode", toTheme)
        localStorage.setItem("color-mode", toTheme)
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

    // tag selection slots
    Array.from(document.querySelectorAll(".tag-container"))
    .forEach(slot => clearTag(slot))

    // tag selection modal
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

    // close tag selection modal button
    document.querySelector("#close-tag-modal").addEventListener("click", () => {
        tagModal.style.display = "none"
        tagSearchElement.value = ""
    })

    // delete all tags
    document.querySelector("#delete-icon").addEventListener("click", event => {
        Array.from(document.querySelectorAll(".tag-container"))
        .forEach(slot => clearTag(slot))
    })

    // filter button
    document.querySelector("#filterBtn").addEventListener("click", () => filter())

    // sort table  
    document.querySelectorAll("th").forEach((th, _, ths) => th.addEventListener("click", () => {
        let isAsc = false
        // update order
        ths.forEach(thead => {
            if (thead.classList.contains("asc") && thead == th)
               isAsc = true
        })
        sortTable(th, !isAsc)
    }))
}

/**
 * Sort table content
 * @param {HTMLElement} target sort table content by the element
 * @param {boolean} toAsc whether it's in ascending order
 */
function sortTable(target, toAsc) {
    const getCellValue = (tr, idx) => tr.children[idx].innerHTML
    const comparator = (idx, asc) => (a, b) => getCellValue(asc ? a : b, idx).localeCompare(getCellValue(asc ? b : a, idx))
    const table = document.querySelector("#result")
    const ths = document.querySelectorAll("th")
    ths.forEach(thead => {
        thead.classList.remove("asc")
        thead.classList.remove("desc")
    })
    target.classList.add(toAsc ? "asc" : "desc")
    Array.from(table.querySelectorAll("tr"))
    .sort(comparator(Array.from(ths).indexOf(target), toAsc))
    .forEach(tr => table.appendChild(tr))
}

/**
 * set up tag selection modal
 * @param {HTMLElement} tagSlot where the chosen tag put
 */
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

/**
 * create and add tag to slot
 * @param {HTMLElement} slot where the chosen tag put
 * @param {HTMLElement} target where the tags in the selection modal put
 * @param {String} attribute attribute of the tag
 * @param {attribute} tagStr name of the tag
 */
function addTag(slot, target, attribute, tagStr) {
    let tag = createTagElemet(attribute, tagStr)
    // put the clicked tag into slot
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
        removeIcon.setAttribute("style", "margin-right: 12px; font-size: 20px; font-weight: bold")
        removeIcon.addEventListener("click", (event) => {
            event.stopImmediatePropagation()
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

/**
 * read all tags from slots
 * @returns {Array<String>} tags string in array
 */
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

/**
 * clear the tag slot
 * @param {HTMLElement} slot where the chosen tag put
 */
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

/**
 * create tag in HTMLElement
 * @param {String} attribute attribute of the tag
 * @param {attribute} tagStr name of the tag
 * @returns {HTMLElement} tag in HTMLElement
 */
function createTagElemet(attribute, tagStr) {
    let tag = document.createElement("div")
    // create tag icon
    let icon = createIconElement("#" + attribute + "-icon")
    icon.classList.add("filter-icon")
    icon.classList.add("tag-icon")
    // add tag text
    let tagText =document.createElement("span")
    tagText.innerHTML = tagStr
    tag.appendChild(icon)
    tag.appendChild(tagText)
    return tag
}


/**
 * create icon in HTMLElement
 * @param {String} iconId id of the icon HTMLElement
 * @returns {HTMLElement} icon in HTMLElement
 */
function createIconElement(iconId) {
    let useIcon = document.createElementNS("http://www.w3.org/2000/svg", "use")
    useIcon.setAttributeNS("http://www.w3.org/1999/xlink", "href", iconId)
    let icon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    icon.appendChild(useIcon)
    return icon
}

/**
 * create tooltip HTMLElement
 * @param {String} tagStr name of the tag
 * @returns {HTMLElement} tooltip HTMLElement
 */
function createTooltip(tagStr) {
    let tooltipContainer = document.createElement("div")
    tooltipContainer.classList.add("distinct")
    tooltipContainer.appendChild(createIconElement("#star-icon"))
    let text = document.createElement("span")
    text.innerHTML = tagStr
    tooltipContainer.appendChild(text)
    // replace event by showing tooltip
    tooltipContainer.addEventListener("click", event =>  event.stopImmediatePropagation())
    return tooltipContainer
}

/**
 * filter the characters by chosen tags
 */
function filter() {
    // read and check tags
    const tagNum = document.querySelector("#applied-tag-num").value
    let validTags = readTag()
    if (validTags.length < tagNum) {
        alert("有效標籤數量過少")
        return
    }

    const enlistHour = document.querySelector("#enlist-hour").value

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

        let result = document.querySelector("#result")
        result.innerHTML = ""

        for (let k = 5; k >= tagNum; k--) {
            // generate combinations
            const queryTagsComb = Array.from(combinations(validTags, k))

            // screen out ineligible characters
            queryTagsComb.forEach(queryTags => {
                let appliedTags = []
                // filter by rank and time
                var fChars
                if (queryTags.includes("領袖"))
                    fChars = enlistHour < 9 ? chars : chars.filter(char => char.grade == 3)
                else if (queryTags.includes("菁英"))
                    fChars = enlistHour < 9 ? chars.filter(char => char.grade < 3) : chars.filter(char => char.grade == 2)
                else
                    fChars = enlistHour < 4 ? chars.filter(char => char.grade < 2) : chars.filter(char => char.grade < 3)
                
                // filter by type, category, race, body and oppai
                for (let i = 0; i < 5; i++) {
                    if (queryTags.length == 0 || fChars.length == 0)
                        break
                    charAttrs[i][1].forEach(attrTag => {
                        if (queryTags.includes(attrTag)) {
                            fChars = fChars.filter(t => t[charAttrs[i][0]] == attrTag)
                            appliedTags.push(attrTag)
                            queryTags.splice(queryTags.indexOf(attrTag), 1)
                        }
                    })
                }
                
                // filter by the rest tags
                const survivors = fChars.filter(char => queryTags.every(t => char.tags.includes(t)))
                queryTags = queryTags.concat(appliedTags)
                let queryTagsStr = queryTags.join(", ")

                let isDistinct = false
                // whether any three (or fewer) tags can lead to only one characters
                if (survivors.length == 1 && queryTags.length <= 3)
                    isDistinct = true

                let addedChars = Array.from(result.children)
                if (addedChars.length > 0)
                chars = chars.filter(
                    char => !addedChars.some(s => s.children[0].innerText == char)
                )

                // update result
                survivors.forEach(survivor => {
                    let isExist = false
                    addedChars.forEach(c => {
                        if (c.children[0].innerText != survivor.name)
                            return true
                        isExist = true
                        let distinctTagElement = c.children[c.childElementCount - 1].children[0]
                        if (isDistinct) {
                            if (distinctTagElement != null) {
                                // update tooltip
                                let curText = distinctTagElement.children[1]
                                let curTagsSet= curText.innerHTML.split("\n")
                                let contains = false
                                for (let i = curTagsSet.length - 1; i >= 0; i--) {
                                    // delete tags if contains another
                                    let curTags = curTagsSet[i].split(", ")
                                    let tagStrs = queryTagsStr.split(", ")
                                    if (tagStrs.every(queryTag => curTags.includes(queryTag))) {
                                        curTagsSet.splice(i, 1)
                                        contains = true
                                    }
                                }
                                if (contains)
                                    curText.innerHTML = curTagsSet.concat([queryTagsStr]).join("\n")
                                else {
                                    // add distinct tags
                                    curTagsSet.push(queryTagsStr)
                                    curText.innerHTML = curTagsSet.join("\n")
                                }
                            } else {
                                // create tooltip
                                c.children[c.childElementCount - 1].appendChild(createTooltip(queryTagsStr))
                            }
                        }
                    })

                    if (isExist)
                        return true

                    let row = result.insertRow()
                    let nameCol = row.insertCell()
                    let rarityCol = row.insertCell()
                    let categoryCol = row.insertCell()
                    let appliedTagsCol = row.insertCell()
                        
                    row.setAttribute("class", survivor.type)
                    nameCol.innerHTML = survivor.name
                    switch (survivor.grade) {
                        case 3:
                            rarityCol.innerHTML = "SSR"
                            break
                        case 2:
                            rarityCol.innerHTML = "SR"
                            break
                        case 1:
                            rarityCol.innerHTML = "R"
                            break
                        default:
                            rarityCol.innerHTML = "N"
                    }
                    categoryCol.innerHTML = survivor.category
                    appliedTagsCol.innerHTML = queryTagsStr
                    appliedTagsCol.style.cursor = "pointer"

                    if (isDistinct) {
                        // create tooltip
                        appliedTagsCol.appendChild(createTooltip(queryTagsStr))
                    }

                    appliedTagsCol.addEventListener("click", () => {
                        if (!confirm("確定要套用該角色標籤?"))
                            return
                        
                        //update table
                        let trs = document.querySelectorAll("tr")
                        for (let i = trs.length - 1; i > 0; i--) {
                            const selectedTags = trs[i].lastChild.innerHTML.split(", ")
                            if (!queryTags.every(t => selectedTags.includes(t)))
                                document.querySelector("#result").deleteRow(i - 1)
                        }
                    })
                })
            })
        }

        if (result.innerHTML == "") {
            alert("無符合結果")
            return
        }

        // sort results by rarity
        sortTable(document.querySelector("#rarity"), false)
    })
}

/**
 * generate the k-combination of elements
 * @param {Array<T>} elements
 * @param {Number} num k distinct elements
 */
function* combinations(elements, num) {
    for (let i = 0; i < elements.length; i++) {
        if (num === 1)
            yield [elements[i]]
        else {
            let remaining = combinations(elements.slice(i + 1, elements.length), num - 1)
            for (let next of remaining)
                yield [elements[i], ...next]
        }
    }
}
