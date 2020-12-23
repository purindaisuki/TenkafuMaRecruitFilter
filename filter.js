window.onload = () => main()

function main() {

    //populate tags into drop lists
    let tagList = document.querySelector("#tagList")
    fetch('./tags.json')
    .then(response => response.json())
    .then(tags => {
        tags.forEach(tag => {
            let option = document.createElement("option")
            option.setAttribute("value", tag)
            option.textContent = tag
            tagList.appendChild(option)
        });
    });

    document.querySelector("#filterBtn").addEventListener("click", () => filter())

    document.querySelectorAll("img").forEach(icon => icon.addEventListener("click", () => {
        icon.parentElement.children[0].value = ""
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
    const tagNum = document.querySelector("#tagAppliedNum").value
    let validTags = []
    Array.from(document.querySelectorAll(".tag")).forEach(element => addTag(validTags, element.children[0].value))
    if (validTags.length < tagNum) {
        alert("有效標籤數量過少")
        return;
    }

    const recruitHour = document.querySelector("#recruitHour").value

    // generate combinations
    const tagComb = Array.from(combinations(validTags, tagNum))

    fetch('./characters.json')
    .then(response => response.json())
    .then(chars => {
        // screen out ineligible characters
        let survivorSet = [[[]]]
        tagComb.forEach(tags => {
            var fChars
            if (tags.includes("領袖"))
                fChars = recruitHour < 9 ? chars : chars.filter(char => char.grade == 3)
            else if (tags.includes("菁英"))
                fChars = recruitHour < 9 ? chars.filter(char => char.grade < 3) : chars.filter(char => char.grade == 2)
            else
                fChars = recruitHour < 4 ? chars.filter(char => char.grade < 2) : chars.filter(char => char.grade < 3)
            const res = fChars.filter(char => tags.every(t => char.tags.includes(t)))
            const survivors = res.filter(char => !survivorSet.some(s => s[0].includes(char)))
            if (survivors.length > 0)
                survivorSet = survivorSet.concat([[survivors, tags]])
        })

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
    let option = document.querySelector("#tagList option[value='" + input + "']")
    if (option != null && option.value.length > 0)
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
