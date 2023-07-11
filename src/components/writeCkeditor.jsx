import { useState, useEffect, useRef } from 'react';

const PH = `
산업안전보건법에 따라 고객응대 근로자 보호조치를 시행하고 있사오니
고객 응대 근로자에게 욕설 또는 폭언 등은 하지 말아주시기 바랍니다.
`

/**
 * ckeditor - write
 * @param {*} props 
 * @returns 
 */
export default function WriteCkeditor(props) {

    const editorRef = useRef()
    const [editorLoaded, setEditorLoaded] = useState(false)
    const { CKEditor, ClassicEditor } = editorRef.current || {}

    useEffect(() => {
        editorRef.current = {
            CKEditor: require('@ckeditor/ckeditor5-react').CKEditor, //Added .CKEditor
            ClassicEditor: require('ckeditor5-custom-build/build/ckeditor'),
        }
        setEditorLoaded(true)
    }, []);

    const [data, setData] = useState(props.data);

    return (
        <>

            {editorLoaded ?
                <CKEditor
                    
                    config={
                        {
                            placeholder: PH
                        }
                    } 
                    editor={ClassicEditor}
                    data={data}
                    onChange={(event, editor) => {
                        const data = editor.getData()
                        setData(data);
                        props.func((p)=>{return{ ...p, contents: data }})
                    }}
                />
                :
                <></>}


        </>
    )
}
