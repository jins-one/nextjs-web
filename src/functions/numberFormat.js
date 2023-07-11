/**
 * number formatting function
 * @param {*} val 값
 * @param {*} isMinus 마이너스 여부
 * @param {*} isFloat 소수점 여부
 * @param {*} isComma 콤마 여부
 * @param {*} decimal 소수점 자리수
 * @returns 
 */
export default function numberFormat(val, isMinus, isFloat, isComma, decimal){
    let str = val;
    //일단 마이너스, 소수점을 제외한 문자열 모두 제거
    str = str.replace(/[^-\.0-9]/g, '');
    //마이너스
    if(isMinus){
       str = chgMinusFormat(str);   
    } else {
       str = str.replace('-','');
    }
    
    //소수점
    if(isFloat){
       str = chgFloatFormat(str, decimal);       
    } else {
       if(!isMinus ){
          str = str.replace('-','');
       }
       str = str.replace('.','');
       if(str.length>1){
          str = Math.floor(str);
          str = String(str);
       }
    }
    
    //콤마처리
    if(isComma){
       let parts = str.toString().split('.');
       if(str.substring(str.length - 1, str.length)=='.'){
          str = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",") +".";
       } else {
          str = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",") + (parts[1] ? "." + parts[1] : "");
       }
    }
  
    return str;
  }
  

  /**
   * 소수점 처리
   * @param {*} str 
   * @returns 
   */
  function chgFloatFormat(str, decimal){
    let idx = str.indexOf('.');  

    if(idx<0){  
       return str;
    } else if(idx>0){
       let tmpStr = str.substr(idx+1);    

       if(tmpStr.length>1){             

          if(tmpStr.indexOf('.')>=0){ 
             tmpStr =  tmpStr.replace(/[^\d]+/g, '');                  
             str = str.substr(0,idx+1) + tmpStr;
          } else {
            if(decimal) {
                tmpStr = tmpStr.substr(0, decimal);
                str = str.substr(0,idx+1) + tmpStr;
            }
          }
       }    

    } else if(idx==0){
          str = '0'+str;
    }
    return str;  
  }
  
  
  /**
   * 마이너스 처리
   * @param {*} str 
   * @returns 
   */
  function chgMinusFormat(str){
    let idx = str.indexOf('-');
    if(idx==0){
    let tmpStr = str.substr(idx+1);
       //뒤에 마이너스가 또 있는지 확인
       if(tmpStr.indexOf('-')>=0){
             tmpStr = tmpStr.replace('-','');
          str = str.substr(0,idx+1) + tmpStr;  
       }
    } else if(idx>0){
          str = str.replace('-','');
    } else if(idx<0){
          return str;
    }
       return str;
  }