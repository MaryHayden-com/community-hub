import { useState, useRef } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

function mapCsvType(rawType) {
  const t = (rawType || "").trim().toLowerCase();
  if (t === "business") return "Business";
  if (t === "club & group" || t === "club" || t === "group") return "Club & Group";
  if (t === "education") return "Education";
  if (t === "what's on" || t === "whats on" || t === "whats-on" || t === "event") return "What's On";
  return "Business";
}

export default function ImportExport({ listings, onImportComplete }) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef();

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              Type: { type: "string" },
              Name: { type: "string" },
              "Group 1": { type: "string" },
              "Group 2": { type: "string" },
              "Group 3": { type: "string" },
              "Category 1": { type: "string" },
              "Category 2": { type: "string" },
              "Category 3": { type: "string" },
              County: { type: "string" },
              Town: { type: "string" },
              "Nearest Town/Area": { type: "string" },
              Description: { type: "string" },
              Address: { type: "string" },
              Phone: { type: "string" },
              Email: { type: "string" },
              Website: { type: "string" },
              "Facebook URL": { type: "string" },
              "Instagram URL": { type: "string" },
              "LinkedIn URL": { type: "string" },
              "Contact Name": { type: "string" },
              "Meeting Info": { type: "string" },
              "Is Featured": { type: "string" },
            },
          },
        },
      });

      if (result.status === "error") {
        toast({ title: "Import Failed", description: result.details, variant: "destructive" });
        setImporting(false);
        return;
      }

      const rows = Array.isArray(result.output) ? result.output : [];
      // Fields that are hidden by default on import — must be claimed to reveal
      const DEFAULT_HIDDEN = ["contact_name", "phone", "email", "address", "meeting_info"];
      const mapped = rows.map((r) => {
        // Collect groups from separate columns
        const groups = ["Group 1", "Group 2", "Group 3"]
          .map(k => (r[k] || "").trim()).filter(Boolean);
        // Collect categories from separate columns
        const cats = ["Category 1", "Category 2", "Category 3"]
          .map(k => (r[k] || "").trim()).filter(Boolean);
        return {
          name: r.Name || "",
          type: mapCsvType(r.Type),
          subcategory_group: groups,
          category: cats,
          county: r.County || "",
          town: r.Town || "",
          area: r["Nearest Town/Area"] || "",
          description: r.Description || "",
          address: r.Address || "",
          phone: r.Phone || "",
          email: r.Email || "",
          website: r.Website || "",
          facebook_url: r["Facebook URL"] || "",
          instagram_url: r["Instagram URL"] || "",
          linkedin_url: r["LinkedIn URL"] || "",
          contact_name: r["Contact Name"] || "",
          meeting_info: r["Meeting Info"] || "",
          is_featured: (r["Is Featured"] || "").toLowerCase() === "yes",
          hidden_fields: DEFAULT_HIDDEN,
        };
      }).filter((r) => r.name && r.town);

      // Bulk create in batches of 50
      for (let i = 0; i < mapped.length; i += 50) {
        const batch = mapped.slice(i, i + 50);
        await base44.entities.CommunityListing.bulkCreate(batch);
      }

      toast({ title: "Import Complete", description: `${mapped.length} listings imported successfully.` });
      onImportComplete?.();
    } catch (err) {
      toast({ title: "Import Error", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleExport = () => {
    setExporting(true);
    try {
      const headers = ["Type", "Name", "Group 1", "Group 2", "Group 3", "Category 1", "Category 2", "Category 3", "County", "Town", "Nearest Town/Area", "Description", "Address", "Phone", "Email", "Website", "Facebook URL", "Instagram URL", "LinkedIn URL", "Contact Name", "Meeting Info", "Is Featured", "Is Verified", "Plan", "Owner Email"];
      const rows = listings.map((l) => {
        const groups = Array.isArray(l.subcategory_group) ? l.subcategory_group : (l.subcategory_group ? [l.subcategory_group] : []);
        const cats = Array.isArray(l.category) ? l.category : (l.category ? [l.category] : []);
        return [
          l.type, l.name,
          groups[0] || "", groups[1] || "", groups[2] || "",
          cats[0] || "", cats[1] || "", cats[2] || "",
          l.county, l.town, l.area || "", l.description || "", l.address || "",
          l.phone || "", l.email || "", l.website || "",
          l.facebook_url || "", l.instagram_url || "", l.linkedin_url || "",
          l.contact_name || "", l.meeting_info || "",
          l.is_featured ? "Yes" : "No",
          l.is_verified ? "Yes" : "No",
          l.plan || "basic",
          l.owner_email || "",
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      // Auto-width columns
      ws["!cols"] = headers.map((h, i) => ({
        wch: Math.max(h.length, ...rows.map(r => String(r[i] || "").length), 10)
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Listings");
      XLSX.writeFile(wb, `community-hub-export-${new Date().toISOString().split("T")[0]}.xlsx`);
      toast({ title: "Export Complete", description: `${listings.length} listings exported to Excel.` });
    } catch (err) {
      toast({ title: "Export Error", description: err.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.json"
        className="hidden"
        onChange={handleImport}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={importing}
      >
        {importing ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Upload className="w-4 h-4 mr-1.5" />}
        {importing ? "Importing..." : "Import"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exporting || !listings?.length}
      >
        {exporting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
        Export Excel
      </Button>
    </div>
  );
}