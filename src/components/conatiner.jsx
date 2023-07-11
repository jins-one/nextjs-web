export default function Container({ children, backgroundColor, borderRadius, width }){
    return (
        <div className="defaultContainer" style={{backgroundColor, borderRadius, width}}>
            {children}
        </div>
    ); 
}