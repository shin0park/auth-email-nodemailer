//이메일 입력\
function authEmail() {
    var email = { "email": document.auth_form.email.value };

    if (!document.auth_form.email.value) {
        return alert('이메일을 입력하세요');
    }
    fetch('/', {
        method: 'post',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(email)
    }).then(function (response) {
        console.log(response);
        return response.text();
    }).then(function (result) {
        console.log(result);
        const vaildTime = result;

        countdown("viewtimer", "timer", Number(vaildTime));
    });

};
//인증번호 입력
function authNumber() {
    var formData = new FormData(document.getElementById('auth_form'));
    var email = document.auth_form.email.value;
    var authNumber = document.auth_form.auth_number.value;

    if (formData.has('email')) {
        formData.delete('email');
    }
    if (formData.has('authNumber')) {
        formData.delete('authNumber');
    }
    formData.append('email', email);
    formData.append('authNumber', authNumber);

    if (!authNumber) {
        return alert('인증번호를 입력하지 않았습니다.');
    }
    fetch('/verify', {
        method: 'post',
        body: formData
    }).then(function (response) {
        console.log(response);
        return response.text();
    }).then(function (result) {
        console.log(result);
        document.auth_form.auth_number.value = '';//인증번호 입력칸 비움.

        if (result == "<h1>Time out</h1>") {
            return alert('유효시간이 초과되었습니다.');
        } else if (result == "<h1>Bad Request</h1>") {
            return alert('인증번호가 일치하지 않습니다.');
        } else if (result == "인증완료") {
            document.auth_form.email.value = '';//이메일 입력칸 비움.
            //인증완료시 해당 타이머 삭제.
            const element = document.getElementById("viewtimer");
            const div = document.getElementById("timer");
            element.removeChild(div);
            //인증완료 알림.
            return alert('인증 완료되었습니다.');
        }

    });
};
//유효시간 countdown
countdown = (elementName, divName, vaildTime) => {//(들어갈 div id, 생성할 div id, 분, 초)
    let element, endTime, secs, mins, msLeft, time, div;
    twoDigits = (n) => { return (n <= 9 ? "0" + n : n); }
    updateTimer = () => {
        msLeft = endTime - (+new Date);
        if (msLeft < 1000) {
            div.innerHTML = "<font color='red'> 시간초과";
        } else {
            time = new Date(msLeft);
            mins = time.getUTCMinutes();
            secs = time.getUTCSeconds();
            msgTime = (mins ? mins + '분' + twoDigits(secs) : secs) + '초';
            var msg = "남은 시간 <font color='red'>" + msgTime;

            div.innerHTML = msg;
            setTimeout(updateTimer, time.getUTCMilliseconds() + 500);

        }
    }
    element = document.getElementById(elementName);//타이머 생성할 부분 불러옴.
    if (element.hasChildNodes()) {//이미 타이머 있을경우 삭제. 다시 새로 인증번호를 받는 예외가 있기 때문에
        element.removeChild(document.getElementById(divName));
    }
    div = document.createElement("div");//폼생성.(타이머)
    div.setAttribute("id", divName);
    element.appendChild(div);

    endTime = (+new Date) + vaildTime + 500;//타이머 끝나는시간 설정.
    updateTimer();
};
