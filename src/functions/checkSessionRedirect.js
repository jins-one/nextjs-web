
/**
 * 로그인 여부 체크 함수
 * @param {*} req 
 * @returns 
 */
export default function checkSessionRedirect(req) {
    let session = req.session.user;

    if(!session) {
        // alert('로그인 세션이 만료되었습니다.');

        return {
            redirect: {
                permanent: false,
                destination: "/login",
              },
        }
    } else {
        return 
    }

}