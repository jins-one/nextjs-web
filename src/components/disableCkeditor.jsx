import { useState, useEffect, useRef } from 'react';


/**
 * ckeditor - read only
 * @param {*} props 
 * @returns 
 */
export default function DisableCkEditor(props) {

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

    return (
        <div className='disableCkeditor'>
            {editorLoaded ?
                <CKEditor
                    type=""
                    editor={ClassicEditor}
                    data={props.contents}
                    disabled
                />
                :
                <></>}

        </div>
    )
}
