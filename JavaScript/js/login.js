function getToken() {
  return localStorage.getItem('token');
}

async function login(event) {
  event.preventDefault(); //서브밋이라는 것은 그 정의대로 흘러가려는 특성이 있어서 이를 막아줌
  // 내가 작성한것 이외에는 서브밋의 로직이 발생하지 않음
  event.stopPropagation(); //상위로 가지않음

  const emailElement = document.querySelector('#email');
  const passwordElement = document.querySelector('#password');

  const email = emailElement.value;
  const password = passwordElement.value;

  //얻어온 이메일과 패스워드를 서버에 보내서 문제가 없는지 확인
  try {
    const res = await axios.post('https://api.marktube.tv/v1/me', {
      email,
      password,
    });

    //정상적으로 왔을 때
    //res라는 곳에다가 data가 담겨옴. data는 객체가 담겨옴!
    const { token } = res.data; //const token = res.data.token
    if (token === undefined) {
      return;
    }
    localStorage.setItem('token', token);
    location.assign('/');
  } catch (error) {
    const data = error.response.data;

    if (data) {
      const state = data.error;
      if (state === 'USER_NOT_EXITST') {
        alert('사용자가 존재하지 않습니다.');
      } else if (state === 'PASSWORD_NOT_MATCH') {
        alert('비밀번호가 틀렸습니다.');
      }
    }
  }
}

function bindLoginButton() {
  const form = document.querySelector('#form-login');
  form.addEventListener('submit', login);
  //버튼에 서브밋 타입이 눌리게되면 폼에서 서브밋이 이벤트가 들어오게됨
  //이벤트가 들어오면 로그인이라는 로직을 실행시킴

  //서브밋이 실행되면 로그인이 서브밋의 이벤트를 가지고 실행됨 그래서 인자로 이벤트가 들어감
}

async function main() {
  //버튼에 이벤트 연결
  bindLoginButton();

  //토큰체크
  const token = getToken();
  if (token != null) {
    location.assign('/');
    return;
  }
}

document.addEventListener('DOMContentLoaded', main);
