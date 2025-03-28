let stuid, data, user, zoomInfo, classList = [[], [], [], [], []]
const colors = ['red', 'pink', 'purple', 'indigo', 'cyan', 'light-green', 'lime', 'amber', 'brown', 'teal', 'light-blue', 'deep-orange', 'green', 'deep-purple', 'yellow', 'blue']

async function notify(className) {
    if (!modalHandler(className, true)) return
    if (Notification.permission !== "granted") await Notification.requestPermission();
    else {
        const zoomList = []
        for (let i of zoomInfo.data) {
            if (i.name === className) zoomList.push({
                id: i.id,
                pwd: i.pwd,
                teacher: i.teacher,
            })
        }
        navigator.serviceWorker.ready.then(function (registration) {
            registration.showNotification('알림', {
                icon: 'notify.png',
                body: `곧 ${className} 수업시간이에요!`,
                actions: zoomList.map(i => {
                    return {
                        action: `zoom.${i.id}.${i.pwd}.${i.teacher}`,
                        title: `${i.teacher}쌤 줌`
                    }
                })
            });
            self.onclick = function (e) {
                e.preventDefault()
                window.focus()
            };
        });

    }
}

function notifyTime() {
    let target, idx = 0;
    const date = new Date().getDay() - 1
    if (date < 0 || date > 4) return
    const classHour = [8, 9, 10, 11, 13, 14, 15, 16, 17]
    const classMinute = [35, 30, 25, 20, 15, 10, 5, 15, 10]
    for (idx = 8; idx >= 0; idx--) {
        if (classHour[idx] == new Date().getHours() && classMinute[idx] <= new Date().getMinutes() && classMinute[idx] + 10 >= new Date().getMinutes()) {
            target = classList[date][idx]
            break
        }
    }
    if (target && !['공강', 'SA', '창체', ' '].includes(target)) {
        if (window.localStorage.target != target) notify(target)
        window.localStorage.target = target
    }
}

function draw() {
    let search = document.getElementById('gf').value
    document.getElementById('name').innerText = user.name
    let totalClass = 0, gg = {}, colorSet = {}, realClass = 0
    classList = [[], [], [], [], []]
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 9; j++) classList[i].push(document.getElementById('gongang').checked ? "공강" : " ")
    }
    let cn = 0
    if (stuid[0] === '2') {
        classList[4][7] = '창체'
        classList[4][8] = '창체'
        classList[4][5] = '동아리'
        classList[4][6] = '동아리'
        classList[2][5] = 'SA'
        classList[2][6] = 'SA'
        classList[2][7] = 'SA'
        classList[2][8] = 'SA'
        if (document.getElementById('color').checked) colorSet['창체'] = colors[0]
        ++cn
        if (document.getElementById('color').checked) colorSet['동아리'] = colors[1]
    }
    if (stuid[0] === '3') {
        classList[2][5] = 'SA'
        classList[2][6] = 'SA'
        classList[2][7] = 'SA'
        classList[4][5] = '동아리'
        classList[4][6] = '동아리'
        if (document.getElementById('color').checked) colorSet['창체'] = colors[0]
        ++cn
        if (document.getElementById('color').checked) colorSet['동아리'] = colors[1]
    }
    if (document.getElementById('color').checked) colorSet['SA'] = colors[cn]
    ++cn
    //console.log(user.data)
    for (let i of user.data) {
        let nowClass = _.filter(data.class, i).length
        totalClass += nowClass
        realClass += nowClass
        if (i.className.includes('AP')) realClass -= 1
        _.filter(data.class, i).forEach((cl) => {
            if (document.getElementById('color').checked) {
                colorSet[cl.className] = colors[cn]
            }
            classList[parseInt(cl.day)][parseInt(cl.time)] = cl.className
            //console.log(classList, cl)
        })

        for (let u of data.user) {
            if (_.find(u.data, i)) {
                if (!gg[u.id]) {gg[u.id] = []}
                gg[u.id].push({name: i.className, time: nowClass})
            }
        }

        ++cn;
    }
    document.getElementById('table').innerHTML = ''
    document.getElementById('stable').innerHTML = ''
    for (let i = 1; i <= 9; i++) {
        document.getElementById('table').innerHTML += `<tr>
            <td>${i}교시</td>
            <td onclick="modalHandler('${classList[0][i - 1]}', 0, ${i - 1});" class="${['공강', 'SA', '창체', ' '].includes(classList[0][i - 1]) ? '' : 'openModal'} ${colorSet[classList[0][i - 1]]} lighten-3">${classList[0][i - 1]}</td>
            <td onclick="modalHandler('${classList[1][i - 1]}', 1, ${i - 1});" class="${['공강', 'SA', '창체', ' '].includes(classList[1][i - 1]) ? '' : 'openModal'} ${colorSet[classList[1][i - 1]]} lighten-3">${classList[1][i - 1]}</td>
            <td onclick="modalHandler('${classList[2][i - 1]}', 2, ${i - 1});" class="${['공강', 'SA', '창체', ' '].includes(classList[2][i - 1]) ? '' : 'openModal'} ${colorSet[classList[2][i - 1]]} lighten-3">${classList[2][i - 1]}</td>
            <td onclick="modalHandler('${classList[3][i - 1]}', 3, ${i - 1});" class="${['공강', 'SA', '창체', ' '].includes(classList[3][i - 1]) ? '' : 'openModal'} ${colorSet[classList[3][i - 1]]} lighten-3">${classList[3][i - 1]}</td>
            <td onclick="modalHandler('${classList[4][i - 1]}', 4, ${i - 1});" class="${['공강', 'SA', '창체', ' '].includes(classList[4][i - 1]) ? '' : 'openModal'} ${colorSet[classList[4][i - 1]]} lighten-3">${classList[4][i - 1]}</td>
        </tr>`;
    }
    
    let mag = 0
    for (let i in gg) {
        if (i !== document.getElementById("stuid").value && (!search || _.find(data.user, {id: i}).name.includes(search))) mag = Math.max(mag, gg[i].length)
    }
    document.getElementById('stableh').innerHTML = `<th>이름</th>
            <th>시간</th>`
    for (let i = 0; i < mag; i++) document.getElementById('stableh').innerHTML += `<th>${i + 1}</th>`

    for (let i of data.user) {
        if (stuid[0] === i.id[0] && stuid !== i.id && !gg[i.id]) gg[i.id] = []
    }

    let gginfo = []
    for (let i in gg) {
        let thtml = '', ti = 0
        for (let j of gg[i]) {
            thtml += `<td class="${colorSet[j.name]} lighten-3">${j.name}</td>`
            ti += j.time
        }
        for (let j = 0; j < mag - gg[i].length; j++) thtml += '<td></td>'
        if (i !== document.getElementById("stuid").value && (!search || _.find(data.user, {id: i}).name.includes(search))) gginfo.push({
            name: _.find(data.user, {id: i}).name,
            id: _.find(data.user, {id: i}).id,
            html: thtml,
            time: ti
        })
    }
    gginfo = _.orderBy(gginfo, ['time'], ['asc']).reverse();
    for (let i of gginfo) {
        document.getElementById('stable').innerHTML += `<tr>
                    <td><A href = "https://kkigon.github.io/myclass/#${i.id}" target = "blank" class="nameLink">${i.name}</A></td>
                    <td>${i.time}시간</td>
                    ${i.html}
                </tr>`
    }
    if (realClass === totalClass) document.getElementById('totalClass').innerText = totalClass + '학점'
    else document.getElementById('totalClass').innerText = totalClass + '시간 (' + realClass + '학점)'
}


function modalHandler(subjectName, dayOrSoon, period, soon) {
    // 만약 두번째 인자가 boolean이면, 이는 soon 플래그임 (즉, day, period 정보는 없는 경우)
    if (typeof dayOrSoon === "boolean") {
        soon = dayOrSoon;
        dayOrSoon = null;
        period = null;
    }
    if (['공강', 'SA', '창체', ' ', '동아리'].includes(subjectName)) return false;
    
    // 현재 사용자가 듣고 있는 수업 중 subjectName과 동일한 수업 찾기
    const userClass = user.data.find(cls => cls.className === subjectName);

    if (userClass) {
        let classInfo;
        if (dayOrSoon !== null && period !== null) {
            // 요일/교시 정보를 반영하여 해당 시간대의 수업 정보를 조회
            classInfo = data.class.find(cl =>
                cl.className === subjectName &&
                Number(cl.day) === dayOrSoon &&
                Number(cl.time) === period &&
                cl.id === userClass.id
            );
        } else {
            // 기존 로직: 요일/시간 정보 없이 수업 정보 조회
            classInfo = data.class.find(cl =>
                cl.className === subjectName &&
                cl.id === userClass.id
            );
        }

        if (classInfo) {
            document.getElementById('modalId').innerText = `${classInfo.className} ${classInfo.id}`;
            document.getElementById('modalContent').innerText = `장소: ${classInfo.place}`;
            
            // 같은 수업을 듣는 학생 목록 가져오기
            const classmates = data.user.filter(otherUser => 
                otherUser.data.some(cls => cls.className === subjectName && cls.id === userClass.id)
            );
            const classmatesNames = classmates
                .filter(otherUser => otherUser.id !== user.id)
                .map(otherUser => otherUser.name)
                .join(', ');
            document.getElementById('modalClassmates').innerText = classmatesNames;
        } else {
            document.getElementById('modalId').innerText = '정보 없음';
            document.getElementById('modalContent').innerText = '해당 과목의 정보가 없습니다.';
            document.getElementById('modalClassmates').innerText = '';
        }
    } else {
        document.getElementById('modalId').innerText = '정보 없음';
        document.getElementById('modalContent').innerText = '해당 과목을 듣고 있지 않습니다.';
        document.getElementById('modalClassmates').innerText = '';
    }

    document.getElementById('modal').style.display = 'block';
    return true;
}



function closeModal() {
    document.getElementById('modal').style.display = 'none';
}


function view() {
    stuid = document.getElementById('stuid').value
    fetch(stuid[0] + ".json")
        .then(response => response.json())
        .then(json => {
            data = json
            user = _.find(data.user, {id: document.getElementById("stuid").value})
            if (!user) {
                M.toast({html: '학번이 올바르지 않아요.'})
                document.getElementById("stuid").value = ""
                return
            }
            if (!location.hash.slice(1) || isNaN(location.hash.slice(1))) history.pushState(null, user.name, '#' + stuid)
            document.getElementById('chooser').classList.add('fout')
            document.getElementById('viewer').classList.remove('fout')
            setTimeout(() => {
                document.getElementById('chooser').style.display = 'none'
                document.getElementById('viewer').style.display = 'flex'
            }, 300)
            draw(true)
        }).catch(() => {
        M.toast({html: '오류가 발생했어요.'})
        document.getElementById("stuid").value = ""
    });
}

document.addEventListener('DOMContentLoaded', () => {
    Notification.requestPermission();
    setInterval(notifyTime, 1000)
    navigator.serviceWorker.register('service.js').then(function (registration) {
        console.log('Service worker successfully registered.');
        return registration;
    }).catch(function (err) {
        console.error('Unable to register service worker.', err);
    });
    fetch('zoom.json').then(res => res.json()).then(json => zoomInfo = json)
    modal = M.Modal.init(document.getElementById('zoomInfo'))
    document.getElementById('stuid').addEventListener("keyup", (e) => {
        if (e.currentTarget.value.length >= 5) view()
    });
    document.getElementById('gf').addEventListener("keyup", (e) => {
        draw()
    });
    window.addEventListener('popstate', (event) => {
        loadPage()
    });
    document.getElementById('stuid').focus()
    loadPage()
})

function loadPage() {
    let currentPage = location.hash.slice(1)
    if (currentPage && !isNaN(currentPage)) {
        document.getElementById('stuid').value = currentPage
        view()
    } else {
        document.getElementById('stuid').value = ''
        document.getElementById('chooser').classList.remove('fout')
        document.getElementById('viewer').classList.add('fout')
        setTimeout(() => {
            document.getElementById('chooser').style.display = 'flex'
            document.getElementById('viewer').style.display = 'none'
            document.getElementById('stuid').focus()
        }, 300)
    }
}

function pr() {
    document.getElementById('sw').style.display = 'none'
    document.getElementById('gg').style.display = 'none'
    document.getElementById('back').style.display = 'none'
    document.getElementById('cont').style.boxShadow = 'none'
    document.getElementById('print').style.display = 'none'
    document.getElementById('copyright').style.display = 'none'
    document.getElementById('viewer').style.overflowY = 'hidden'
    window.print()
    document.getElementById('sw').style.display = 'inline-block'
    document.getElementById('gg').style.display = ''
    document.getElementById('back').style.display = ''
    document.getElementById('cont').style.boxShadow = ''
    document.getElementById('print').style.display = ''
    document.getElementById('copyright').style.display = ''
    document.getElementById('viewer').style.overflowY = ''
}

const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission()
    if (permission !== 'granted') {
        throw new Error('Permission not granted for Notification')
    }
}
