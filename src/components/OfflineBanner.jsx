import { useOfflineStatus } from '../hooks/useOfflineStatus'
import { WifiOff, Wifi } from 'lucide-react'

function OfflineBanner() {
  const { isOffline, wasOffline } = useOfflineStatus()

  if (!isOffline && !wasOffline) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px 20px',
      borderRadius: '12px',
      fontSize: '0.85rem',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 10001,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease',
      ...(isOffline ? {
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white',
      } : {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
      })
    }}>
      {isOffline ? (
        <>
          <WifiOff size={16} />
          You're offline. Changes will sync when reconnected.
        </>
      ) : (
        <>
          <Wifi size={16} />
          Back online! Syncing...
        </>
      )}
    </div>
  )
}

export default OfflineBanner
