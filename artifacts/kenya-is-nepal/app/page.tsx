import SiteApp from '@/site';

export default function Page() {
  return (
    <div>
      <div style={{backgroundColor:'#FEF3C7', padding:'20px', textAlign:'center', borderBottom:'3px solid #F59E0B'}}>
        <h1 style={{fontSize:'20px', fontWeight:'bold'}}>🇰🇪 KENYA STANDS WITH NEPAL 🇳🇵<br/>A CALL FOR HUMANITY</h1>
        <p style={{fontSize:'14px', marginTop:'10px'}}>
          From Kenya to Nepal - Vasudhaiva Kutumbakam - The World is One Family.<br/>
          1,300 lives lost, 5,000 missing, 84,000 displaced by Nepal floods.<br/>
          We need your Prayers, Solidarity and Humanitarian Support.
        </p>
        <p style={{backgroundColor:'white', padding:'10px', marginTop:'10px', fontSize:'12px', border:'1px dashed orange'}}>
          <b>IMPORTANT:</b> We are creating official legal accounts for donations. Please be patient. DO NOT send money to personal accounts yet. Official channels will be published here soon.
        </p>
      </div>
      <SiteApp page="home" />
    </div>
  );
}
