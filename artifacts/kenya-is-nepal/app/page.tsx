import SiteApp from '@/site';

export default function Page() {
  return (
    <>
      <div style={{background: '#fef3c7', borderBottom: '3px solid #f59e0b', padding: '24px 20px', textAlign: 'center'}}>
        <h1 style={{fontSize: '22px', fontWeight: 'bold', color: '#92400e', lineHeight: '1.3'}}>🇰🇪 KENYA STANDS WITH NEPAL 🇳🇵<br/>A CALL FOR HUMANITY</h1>
        <p style={{marginTop: '14px', fontSize: '14px', lineHeight: '1.6', color: '#333', maxWidth: '800px', margin: '14px auto 0'}}>
          From the heart of Kenya to the mountains of Nepal - <b>Vasudhaiva Kutumbakam - The World is One Family.</b><br/><br/>
          Our brothers and sisters in Nepal face catastrophe: Over 1,300 lives lost, 5,000 missing, 84,000 displaced by the floods of Aug 26, 2026.<br/><br/>
          We call you to stand with us in <b>Prayers, Solidarity, and Humanitarian Support.</b><br/><br/>
          <span style={{background: 'white', padding: '10px', borderRadius: '8px', border: '1px dashed #f59e0b', display: 'block', marginTop: '10px'}}>
          <b>IMPORTANT NOTICE:</b> We are working with legal authorities in Kenya & Nepal to create official, transparent, authorized accounts for donations. Please be patient - <b>DO NOT send money to any personal account yet.</b> Official donation channels will be published here once verified.
          </span>
        </p>
      </div>
      <SiteApp page="home" />
    </>
  );
}
