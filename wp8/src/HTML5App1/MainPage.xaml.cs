using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;
using Microsoft.Phone.Controls;
using Microsoft.Phone.Shell;
using Microsoft.Phone.Tasks;

namespace HTML5App1
{
    public partial class MainPage : PhoneApplicationPage
    {
        // Url of Home page
        private string MainUri = "HTML/index.html";

        // Constructor
        public MainPage()
        {
            InitializeComponent();
        }

        private void Browser_Loaded(object sender, RoutedEventArgs e)
        {
            // Add your URL here
            Browser.IsScriptEnabled = true;
            Browser.Navigate(new Uri(MainUri, UriKind.Relative));
        }

        // Navigates back in the web browser's navigation stack, not the applications.
        private void BackApplicationBar_Click(object sender, EventArgs e)
        {
            Browser.GoBack();

            

        }

        // Navigates forward in the web browser's navigation stack, not the applications.
        private void ForwardApplicationBar_Click(object sender, EventArgs e)
        {
            Browser.GoForward();
        }

        // Navigates to the initial "home" page.
        private void HomeMenuItem_Click(object sender, EventArgs e)
        {
            Browser.Navigate(new Uri(MainUri, UriKind.Relative));
        }

        // Handle navigation failures.
        private void Browser_NavigationFailed(object sender, System.Windows.Navigation.NavigationFailedEventArgs e)
        {
            MessageBox.Show("Navigation to this page failed, check your internet connection");
        }

        private void btnIconicTile_Click(object sender, RoutedEventArgs e)
        {
            IconicTileData oIcontile = new IconicTileData();
            oIcontile.Title = "Flinger.co Remote";
            oIcontile.Count = 0;

            oIcontile.IconImage = new Uri("Assets/Tiles/Iconic/202x202.png", UriKind.Relative);
            oIcontile.SmallIconImage = new Uri("Assets/Tiles/Iconic/110x110.png", UriKind.Relative);

            oIcontile.WideContent1 = "windows phone 8 Live tile";
            oIcontile.WideContent2 = "Icon tile";
            oIcontile.WideContent3 = "All about Live tiles By WmDev";

            oIcontile.BackgroundColor = System.Windows.Media.Colors.Orange;

            // find the tile object for the application tile that using "Iconic" contains string in it.
            ShellTile TileToFind = ShellTile.ActiveTiles.FirstOrDefault(x => x.NavigationUri.ToString().Contains("Iconic".ToString()));

            if (TileToFind != null && TileToFind.NavigationUri.ToString().Contains("Iconic"))
            {
                TileToFind.Delete();
                ShellTile.Create(new Uri("/MainPage.xaml?id=Iconic", UriKind.Relative), oIcontile, true);
            }
            else
            {
                ShellTile.Create(new Uri("/MainPage.xaml?id=Iconic", UriKind.Relative), oIcontile, true);
            }
        }

        private void Browser_Navigating(object sender, NavigatingEventArgs e)
        {
            //this.Browser.Opacity = 0.0;

            //Prevent external URLs contaning http:// from opening within the apps frame.
            if (e.Uri.ToString().Contains("http://")) {

                e.Cancel = true;

                WebBrowserTask webBrowserTask = new WebBrowserTask();

                webBrowserTask.Uri = new Uri(e.Uri.ToString(), UriKind.Absolute);

                webBrowserTask.Show();
            }

        }
        private void Browser_LoadCompleted(object sender, NavigationEventArgs e)
        {
            this.Browser.Opacity = 1.0;
        }
        public void SetHtml(string html)
        {
            
            this.Browser.Opacity = 0.0;
            this.Browser.NavigateToString(html);
        }


    }
}