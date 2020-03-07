function getToken() {
  return localStorage.getItem('token'); //토큰이라는 값을 저장함
  //Storage 객체는 단순한 key-value 저장소로서 선택한 값을 localStorage에 저장했다면, 페이지를 나갔다가 나중에 다시 들어왔을 떄 이전에 저장한 값을 기억
}

async function getUserByToken(token) {
  //유저정보를 가져오는 함수 작성
  try {
    //서버에서 요청한 것에 대한 결과가 response로 저장됨
    const res = await axios.get('https://api.marktube.tv/v1/me', {
      //me 다음에 get이지만 헤더에다가 토큰값을 담아서 보내야됨 -> headers
      headers: {
        Authorization: `Bearer ${token}`, //이렇게 서버와 전달한다!라고 약속되어 있는 것
        //토큰 값을 서버에서 계산을 해서 문제가 없는지 확인하고 나서
        //문제가 없으면 그 토큰을 가지고 있는 유저의 정보를 내려주게 됨
        //로그인 할때 토큰을 가지게 됨. 로그인 정보가 맞으면 토큰을 내려줌
      },
    });
    return res.data; //이 데이터는 유저의 정보
  } catch (error) {
    console.log('getUserByToken error', error);
    return null; //try의 행위를 하다가 문제가 생겼을 때 null로 나옴 -> 토큰으로 서버에서 나의 정보 받아오기 구문의 if문으로 가게됨.
  }
}

async function save(event) {
  //원래 html에서 가지고 있는 submit버튼을 누르면 폼이 하는 행동을 정지시켜야 하는 함수
  event.preventDefault(); //이 함수를 써주지 않으면 save버튼을 눌렀을 때 콘솔에 save가 찍히지 않고, 그냥 새로고침됨 url에 ?뜸
  event.stopPropagation(); //상위DOM에 이벤트가 전달되지 않도록! 사실 여기서는 의미 없음.
  console.log('save');

  event.target.classList.add('was-validated'); //bootstrap에 있는 기능 : was~가 추가되면 버튼이 문제가 없기 떄문에 그런 UI로 바뀌게 되는 기능

  const titleElement = document.querySelector('#title');
  const messageElement = document.querySelector('#message');
  const authorElement = document.querySelector('#author');
  const urlElement = document.querySelector('#url');

  const title = titleElement.value;
  const message = messageElement.value;
  const author = authorElement.value;
  const url = urlElement.value;

  // 기본적인 유효성 검사는 클라이언트에서도 해줘야함
  if (title === '' || message === '' || author === '' || url === '') {
    return;
  }

  const token = getToken();
  if (token === null) {
    location.assign('/login');
    return;
  }

  try {
    //res를 받아서 뭔가 표현해줄 것이 없기 때문에 res없이 진행해도 됨
    const res = await axios.post(
      'https://api.marktube.tv/v1/book',
      {
        //바디로 DOM에서 얻은 value들을 넣어줌. 대신 바디만 넣은게 아니라 옵션으로 얻은 토큰도 넣어줌
        title,
        message,
        author,
        url,
      },
      {
        //이 api는 토큰을 가지고 있는 사람을 사용할 수 있다.라는 것을 증명해주는 용도
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    location.assign('/');
  } catch (error) {
    console.log('save error', error);
    alert('책 추가 실패');
  }
}

function bindSaveButton() {
  const form = document.querySelector('#form-add-book'); //id가 form-add-book 인 div 영역을 선택
  form.addEventListener('submit', save); //이벤트 연결
  //서브밋이라는 이벤트가 발생하면 save라는 함수를 실행해라
}

//await를 사용하는 main함수도 async이어야함
async function main() {
  // 버튼에 이벤트 연결 - 책 내용을 적은 다음에 save 버튼을 누르면 폼으로 전송하는 submit을 하는 버튼을 연결하기 위함
  bindSaveButton();

  // 토큰 체크
  const token = getToken();
  if (token === null) {
    location.assign('/login');
    // location.href = '/login';
    return; //더이상 실행할 것이 없으므로
  }

  // 토큰으로 서버에서 나의 정보 받아오기(토큰이 유효한지 체크하기 위해)
  const user = await getUserByToken(token);
  if (user === null) {
    localStorage.clear(); //아무 인자도 받지 않고, 해당 도메인의 저장소 객체 전체를 비워버림
    location.assign('/login');

    return;
  }

  console.log(user);
}

document.addEventListener('DOMContentLoaded', main);

/*
document.querySelector 사용할 때 주의
 CSS 구문을 따르지 않는, 예컨대 콜론이나 공백을 포함한 선택자나 ID를 사용해야 하면, 반드시  백슬래시("\")를 사용해 해당 문자를 이스케이프해야 합니다. 
 백슬래시는 JavaScript의 이스케이프 문자이기 때문에, 백슬래시를 문자로 입력하려면 반드시 두 번 이스케이프해야 합니다. 
 한 번은 JavaScript 문자열에 필요하고, 또 다른 한 번은 querySelector()에 필요합니다.
 */
