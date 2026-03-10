using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Cinemac.Api.Hubs
{
    // මෙය තමයි සන්නිවේදන මධ්‍යස්ථානය
    public class BookingHub : Hub
    {
        // ඇඩ්මින් කෙනෙක් බුකින් එකක් update කළ විට මෙම method එක call වේ
        public async Task NotifyBookingUpdate(Guid bookingId, string status)
        {
            // දැනට වෙබ් එකේ ඉන්න හැමෝටම මේ පණිවිඩය යවන්න
            await Clients.All.SendAsync("ReceiveBookingUpdate", bookingId, status);
        }
    }
}