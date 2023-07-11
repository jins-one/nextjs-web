import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import apiFetch2 from "./apiFetch2";


// const test2 = useCallback(async(url, obj)=>{
//     setResValue(await apiFetch2(url, obj))
// })
// const test = debounce(test2, 500);


/////
// const priceCallback = useCallback(async (value)=>{
//     return await value;
// });

// const useDebounce = priceCallback()

///////
// const useDebounce = (value, delay) => {
//     const [debouncedValue, setDebouncedValue] = useState(value);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setDebouncedValue(value);
//         }, delay);

//         return () => {
//             clearTimeout(timer);
//         }; //value 변경 시점에 clearTimeout을 해줘야함.
//     }, [value]);

//     return debouncedValue;
// };

// const useDebounce = useCallback(async (url, obj) => {
//     return await apiFetch2(url, obj);
// });

// export default useDebounce;