# Delete Reservation Feature Implementation

## Feature Overview
Added functionality for customers to delete reservation history when status is confirmed, completed, or cancelled. Pending reservations cannot be deleted for business logic reasons.

## Changes Made

### 1. Frontend Component Changes
**File**: `/components/customer/customer-reservations.tsx`

#### Added Delete Function:
```typescript
const handleDeleteReservation = async (id: string) => {
  const customerId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
  if (!customerId) return

  if (!confirm("Apakah Anda yakin ingin menghapus riwayat reservasi ini?")) {
    return
  }

  try {
    const res = await fetch(`/api/customer/reservations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, customerId }),
    })
    if (res.ok) {
      // Refresh to get latest data
      fetchReservations()
    } else {
      alert("Gagal menghapus reservasi. Silakan coba lagi.")
    }
  } catch (error) {
    alert("Terjadi kesalahan. Silakan coba lagi.")
  }
}
```

#### Updated UI Logic:
- **Pending reservations**: Only show "Batalkan Reservasi" button
- **Confirmed reservations**: Show confirmation message + "Hapus Riwayat" button
- **Completed reservations**: Show "Hapus Riwayat" button only
- **Cancelled reservations**: Show "Hapus Riwayat" button only

#### UI Implementation:
```typescript
{reservation.status === "confirmed" && (
  <div className="space-y-2">
    <div className="text-center text-sm text-green-700 bg-green-50 p-3 rounded-lg">
      Reservasi Anda telah dikonfirmasi. Silakan hubungi agen jika perlu perubahan.
    </div>
    <Button
      onClick={() => handleDeleteReservation(reservation.id)}
      variant="outline"
      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <X size={16} className="mr-2" />
      Hapus Riwayat
    </Button>
  </div>
)}
{(reservation.status === "completed" || reservation.status === "cancelled") && (
  <Button
    onClick={() => handleDeleteReservation(reservation.id)}
    variant="outline"
    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
  >
    <X size={16} className="mr-2" />
    Hapus Riwayat
  </Button>
)}
```

### 2. Backend API Changes
**File**: `/app/api/customer/reservations/route.ts`

#### Added DELETE Method:
```typescript
export async function DELETE(req: NextRequest) {
  try {
    const { id, customerId } = await req.json();
    if (!id || !customerId) return NextResponse.json({ error: "id and customerId are required" }, { status: 400 });
    
    const supabase = getServiceSupabaseClient();
    
    // First check if reservation exists and belongs to the customer
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("status, customer_id")
      .eq("id", id)
      .single();
      
    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
    if (!reservation) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    if (reservation.customer_id !== customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    
    // Check if reservation is in a deletable status (not pending)
    if (reservation.status === "pending") {
      return NextResponse.json({ error: "Cannot delete pending reservations" }, { status: 400 });
    }
    
    // Delete the reservation
    const { error: deleteError } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id);
      
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
    
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
```

## Business Logic

### Deletion Rules:
1. **✅ Can Delete**: confirmed, completed, cancelled reservations
2. **❌ Cannot Delete**: pending reservations (must be cancelled first)
3. **✅ Authorization**: Only customer who owns the reservation can delete it
4. **✅ Confirmation**: User must confirm before deletion

### Status Flow:
```
Pending → Cancelled → Can Delete
Pending → Confirmed → Can Delete  
Confirmed → Completed → Can Delete
```

## Security Features

### API Validation:
- **Customer Ownership Check**: Verifies reservation belongs to requesting customer
- **Status Validation**: Prevents deletion of pending reservations
- **Authorization**: Returns 403 if customer doesn't own reservation
- **Error Handling**: Proper error messages and status codes

### Frontend Protection:
- **Confirmation Dialog**: User must confirm before deletion
- **Conditional Buttons**: Delete button only shows for appropriate statuses
- **Error Handling**: User-friendly error messages

## User Experience

### Visual Design:
- **Red Theme**: Delete buttons use red color scheme for danger indication
- **Consistent Styling**: Matches existing cancel button design
- **Clear Labels**: "Hapus Riwayat" for clear action indication
- **Icons**: X icon for delete action

### User Flow:
1. User sees reservation list
2. For non-pending reservations, delete button is visible
3. Click delete button → confirmation dialog appears
4. Confirm → reservation is deleted and list refreshes
5. Error handling if deletion fails

## Benefits

1. **Clean Interface**: Users can remove old/completed reservations
2. **Data Privacy**: Users can delete their reservation history
3. **Business Logic**: Prevents accidental deletion of active pending reservations
4. **User Control**: Gives users control over their reservation data

## Files Modified
- `/components/customer/customer-reservations.tsx` - Frontend delete functionality
- `/app/api/customer/reservations/route.ts` - Backend DELETE endpoint

## Testing Considerations
- Test deletion with different statuses
- Test authorization (customer ownership)
- Test error handling scenarios
- Test confirmation dialog behavior
- Test UI refresh after deletion
