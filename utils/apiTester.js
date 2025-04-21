/**
 * Công cụ để test API trực tiếp
 */
export const ApiTester = {
  /**
   * Kiểm tra API thêm liên hệ
   */
  async testAddContact(userId, name = "Test Contact", phone = "0987654321") {
    console.log("\n=== TEST ADD CONTACT API ===");
    try {
      const contact = {
        user_id: userId, 
        name, 
        phone,
        address: "Test Address"
      };
      
      console.log("Sending data:", contact);
      const response = await fetch("https://viegrand.site/api/emergency_contacts.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      });
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      try {
        const json = JSON.parse(responseText);
        console.log("JSON response:", json);
      } catch (e) {
        console.log("Not a JSON response");
      }
    } catch (error) {
      console.error("API Test error:", error);
    }
    console.log("=== END TEST ===\n");
  },
  
  /**
   * Kiểm tra API lấy danh sách liên hệ
   */
  async testGetContacts(userId) {
    console.log("\n=== TEST GET CONTACTS API ===");
    try {
      console.log(`Fetching contacts for user_id: ${userId}`);
      const response = await fetch(`https://viegrand.site/api/emergency_contacts.php?user_id=${userId}`);
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      try {
        const json = JSON.parse(responseText);
        console.log("JSON response:", json);
      } catch (e) {
        console.log("Not a JSON response");
      }
    } catch (error) {
      console.error("API Test error:", error);
    }
    console.log("=== END TEST ===\n");
  },
  
  /**
   * Test toàn bộ luồng CRUD contact
   */
  async testContactCRUD(userId) {
    console.log("\n=== TESTING COMPLETE CONTACT CRUD FLOW ===");
    let contactId;
    
    // 1. Add contact
    try {
      console.log("STEP 1: Adding new contact");
      const contact = {
        user_id: userId, 
        name: "Test CRUD Contact", 
        phone: "0987123456",
        address: "CRUD Test Address"
      };
      
      const response = await fetch("https://viegrand.site/api/emergency_contacts.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      });
      
      const responseText = await response.text();
      console.log("Add response:", responseText);
      
      try {
        const json = JSON.parse(responseText);
        contactId = json.id;
        console.log("Contact added with ID:", contactId);
      } catch (e) {
        console.error("Failed to parse add response");
        return;
      }
      
      if (!contactId) {
        console.error("No contact ID returned, cannot continue test");
        return;
      }
    } catch (error) {
      console.error("Add contact error:", error);
      return;
    }
    
    // 2. Get contacts to verify addition
    try {
      console.log("\nSTEP 2: Verifying contact was added");
      const response = await fetch(`https://viegrand.site/api/emergency_contacts.php?user_id=${userId}`);
      const json = await response.json();
      console.log("Get contacts response:", json);
      
      const foundContact = json.data.find(contact => contact.id === contactId);
      console.log("Found added contact?", foundContact ? "Yes" : "No");
    } catch (error) {
      console.error("Get contacts error:", error);
    }
    
    // 3. Update contact
    if (contactId) {
      try {
        console.log("\nSTEP 3: Updating contact");
        const updatedContact = {
          id: contactId,
          user_id: userId,
          name: "Updated CRUD Contact",
          phone: "0987123456",
          address: "Updated CRUD Address"
        };
        
        const response = await fetch("https://viegrand.site/api/emergency_contacts.php", {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedContact),
        });
        
        const responseText = await response.text();
        console.log("Update response:", responseText);
      } catch (error) {
        console.error("Update contact error:", error);
      }
    }
    
    // 4. Delete contact
    if (contactId) {
      try {
        console.log("\nSTEP 4: Deleting contact");
        const response = await fetch("https://viegrand.site/api/emergency_contacts.php", {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: contactId, user_id: userId }),
        });
        
        const responseText = await response.text();
        console.log("Delete response:", responseText);
      } catch (error) {
        console.error("Delete contact error:", error);
      }
    }
    
    // 5. Verify deletion
    try {
      console.log("\nSTEP 5: Verifying contact was deleted");
      const response = await fetch(`https://viegrand.site/api/emergency_contacts.php?user_id=${userId}`);
      const json = await response.json();
      
      const foundContact = json.data.find(contact => contact.id === contactId);
      console.log("Contact still exists?", foundContact ? "Yes (Problem!)" : "No (Deleted successfully)");
    } catch (error) {
      console.error("Final verification error:", error);
    }
    
    console.log("=== END CRUD TEST ===\n");
  }
};
