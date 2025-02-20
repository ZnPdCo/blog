(() => {
    const expiredTime = "2026/2/2 00:00:00";

    const setTime = new Date(expiredTime);

    const nowTime = new Date();

    const restSec = setTime.getTime() - nowTime.getTime();

    const day = parseInt(restSec / (60 * 60 * 24 * 1000));

    if (day <= 20) {
        if (document.getElementsByClassName('cover__intro').length) document.getElementsByClassName('cover__intro')[0].append(`域名即将过期，注意续费。`)
    }

    document.getElementsByClassName('footer')[0].append(`域名过期时间：${expiredTime}，距离域名过期还有 ${day} 天。`)
})();
