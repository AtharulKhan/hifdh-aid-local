import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState({
    restaurantName: "Le Bon Restaurant",
    address: "123 Rue de la Gastronomie",
    phone: "+33 1 23 45 67 89",
    notifications: true,
    darkMode: false,
    autoPrint: true
  });

  const handleSave = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos modifications ont été enregistrées avec succès."
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Paramètres</h1>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Informations du restaurant</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restaurant-name">Nom du restaurant</Label>
              <Input 
                id="restaurant-name" 
                value={settings.restaurantName}
                onChange={(e) => setSettings({...settings, restaurantName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input 
                id="address" 
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input 
                id="phone" 
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Préférences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications sonores</Label>
              <Switch 
                id="notifications" 
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Mode sombre</Label>
              <Switch 
                id="dark-mode" 
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-print">Impression automatique</Label>
              <Switch 
                id="auto-print" 
                checked={settings.autoPrint}
                onCheckedChange={(checked) => setSettings({...settings, autoPrint: checked})}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline">Annuler</Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;