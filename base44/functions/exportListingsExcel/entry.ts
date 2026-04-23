import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import * as XLSX from 'npm:xlsx@0.18.5';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all listings
    const listings = await base44.entities.CommunityListing.list();

    // Transform data into Excel rows
    const data = listings.map((l) => ({
      'Name': l.name || '',
      'Type': l.type || '',
      'Category': Array.isArray(l.category) ? l.category.join(', ') : (l.category || ''),
      'Description': l.description || '',
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Listings');

    // Set column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 30 },
      { wch: 40 },
    ];

    // Generate Excel file
    const excelBytes = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    return new Response(new Uint8Array(excelBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=listings.xlsx',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});