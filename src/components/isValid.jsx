import { useEffect, useRef, useState } from "react";

export default function ValidText(props) {
    const type = props.valueType;
    const validRef = useRef();

    const [mobile, setMobile] = useState(false);

    useEffect(()=>{
        let mWidth = window.matchMedia("screen and (max-width: 1250px)");
        if (mWidth.matches) {
          validRef.current.style.fontSize='0.75rem';
          setMobile(true);
        } else {
            validRef.current.style.fontSize='0.875rem';
            setMobile(false);
        }
    }, [])

    if (type == 'name') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *성함을 입력해 주세요
            </span>
        )
    } else if (type == 'accept') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *본인인증 미동의시 인증이 불가합니다.
            </span>
        )
    }
    else if (type == 'phone') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *휴대폰번호를 확인하여 다시 입력해주세요
            </span>
        )
    } else if (type == 'num') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *인증번호를 확인하여 다시 입력하세요
            </span>
        )
    } else if (type == 'pw') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *비밀번호가 일치하지 않습니다.
            </span>
        )
    } else if (type == 'newpw') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *숫자, 대문자, 소문자, 특수문자 포함 8~20자리를 입력하여 주세요.
            </span>
        )
    } else if (type == 'wpw') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *같은 숫자를 연속하여 사용할 수 없습니다.
            </span>
        )
    } else if (type == 'waddress') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *지갑주소를 다시 확인하여 주세요.
            </span>
        )
    } else if (type == 'nochar') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *한글 또는 영문만 입력가능합니다. <br style={{display:mobile?'block':'none'}}/>(숫자, 특수문자 입력불가)
            </span>
        )
    } else if (type == 'deposit') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *예치가능한 금액을 다시 확인하여 주세요
            </span>
        )
    } else if (type == 'select') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *문의유형을 선택하세요
            </span>
        )
    } else if (type == 'title') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *제목을 입력해주세요
            </span>
        )
    } else if(type=='email') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *이메일 양식이 올바르지 않습니다.
            </span>
        )
    } else if(type=='email_check') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *이메일 인증을 완료해주세요
            </span>
        )
    } else if(type=='phone_check') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *휴대폰 인증을 완료해주세요
            </span>
        )
    } else if(type=='login') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *이메일 또는 비밀번호가 잘못되었습니다
            </span>
        )
    } else if(type=='birth') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *생년월일을 선택해주세요.
            </span>
        )
    } 
    else if(type=='essential') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *필수항목입니다.
            </span>
        )
    } 
    else if(type=='wpw2') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *8자리를 모두 입력해주세요
            </span>
        )
    } 
    else if(type=='birth2') {
        return (
            <span style={{ color: '#FF0000' }} ref={validRef}>
                *생년월일을 입력해주세요.
            </span>
        )  
    }
    else {
        return (<></>)
    }



}